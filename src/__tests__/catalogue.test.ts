import { describe, it, expect } from 'vitest';
import { productsData } from '../data/products';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';

describe('Product Catalogue Single Source of Truth', () => {
  it('contains exactly 17 verified products', () => {
    expect(productsData).toHaveLength(17);
    expect(VERIFIED_PRODUCTS).toHaveLength(17);
  });

  it('has valid pricing, weights, ingredients, and image paths on every product', () => {
    for (const p of productsData) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.mrp).toBeGreaterThan(0);
      if (p.discountPrice !== undefined) {
        expect(p.discountPrice).toBeGreaterThan(0);
        expect(p.discountPrice).toBeLessThanOrEqual(p.mrp);
      }
      expect(p.ingredients.length).toBeGreaterThan(10);
      expect(p.netWeightOrVol.length).toBeGreaterThan(1);
      expect(p.image.startsWith('/')).toBe(true);
    }
  });
});
