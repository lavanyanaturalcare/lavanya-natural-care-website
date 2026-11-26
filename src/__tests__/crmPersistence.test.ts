import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('../services/supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: (...args: any[]) => mockFrom(...args),
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args)
    }
  }
}));

// Provide minimal browser storage mocks for Node environment
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => storageMap.set(k, v),
  removeItem: (k: string) => storageMap.delete(k)
};

import {
  createConversation,
  saveMessage,
  getConversations,
  createEnquiry,
  logAdminAction,
  getAdminAuditLogs
} from '../services/crmService';

describe('CRM & Chat History Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMap.clear();
  });

  it('creates a conversation and saves chat messages with metadata', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'conv-uuid-123', error: null });
    const conv = await createConversation(undefined, undefined, 'Widget: Neem soap?');
    expect(conv.id).toBe('conv-uuid-123');
    expect(mockRpc).toHaveBeenCalledWith('start_guest_conversation', expect.objectContaining({
      p_summary: 'Widget: Neem soap?'
    }));

    mockRpc.mockResolvedValueOnce({ data: 'msg-uuid-456', error: null });
    const saved = await saveMessage('conv-uuid-123', 'customer', 'Which soap for oily skin?', [], {
      source: 'floating_widget'
    });
    expect(saved.id).toBe('msg-uuid-456');
    expect(saved.metadata).toEqual({ source: 'floating_widget' });
  });

  it('throws a visible error if message persistence fails (does not silently swallow)', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } });
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'RLS denied' } })
    });

    await expect(saveMessage('conv-1', 'customer', 'Hello')).rejects.toThrow('Unable to save message');
  });

  it('returns conversations with messages sorted chronologically by created_at', async () => {
    const unorderedRows = [
      {
        id: 'conv-1',
        session_id: 'sess-1',
        started_at: '2026-11-27T00:00:00Z',
        last_activity_at: '2026-11-27T00:05:00Z',
        status: 'active',
        created_at: '2026-11-27T00:00:00Z',
        updated_at: '2026-11-27T00:05:00Z',
        messages: [
          { id: 'm2', conversation_id: 'conv-1', sender: 'ai', message_content: 'Second', created_at: '2026-11-27T00:02:00Z' },
          { id: 'm1', conversation_id: 'conv-1', sender: 'customer', message_content: 'First', created_at: '2026-11-27T00:01:00Z' }
        ]
      }
    ];

    mockFrom.mockReturnValue({
      select: () => ({
        order: () => Promise.resolve({ data: unorderedRows, error: null })
      })
    });

    const convs = await getConversations();
    expect(convs).toHaveLength(1);
    expect(convs[0].messages?.map(m => m.message_content)).toEqual(['First', 'Second']);
  });

  it('persists enquiries via submit_guest_enquiry RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'enq-uuid-789', error: null });
    const enq = await createEnquiry({
      customer_name: 'Aarav',
      contact_details: 'aarav@example.com | 9876543210',
      enquiry_type: 'contact_form',
      message: '[General] Question about Kesuda soap',
      status: 'new'
    });
    expect(enq.id).toBe('enq-uuid-789');
    expect(mockRpc).toHaveBeenCalledWith('submit_guest_enquiry', expect.objectContaining({
      p_customer_name: 'Aarav',
      p_enquiry_type: 'contact_form'
    }));
  });

  it('logs and reads admin audit logs using exact schema columns', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'audit-1', error: null });
    await logAdminAction('UPDATE_PRODUCT_INLINE', 'products', 'kesuda-palash-soap', {
      old_value: { mrp: 149 },
      new_value: { mrp: 159 }
    });
    expect(mockRpc).toHaveBeenCalledWith('log_admin_action', expect.objectContaining({
      p_action: 'UPDATE_PRODUCT_INLINE',
      p_target_entity: 'products',
      p_target_id: 'kesuda-palash-soap'
    }));

    mockFrom.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({
            data: [
              {
                id: 'audit-1',
                admin_email: 'owner@onznatural.com',
                action: 'UPDATE_PRODUCT_INLINE',
                target_entity: 'products',
                target_id: 'kesuda-palash-soap',
                details: { old_value: { mrp: 149 }, new_value: { mrp: 159 } },
                created_at: '2026-11-27T00:10:00Z'
              }
            ],
            error: null
          })
        })
      })
    });

    const logs = await getAdminAuditLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].target_entity).toBe('products');
    expect(logs[0].admin_email).toBe('owner@onznatural.com');
  });
});
