import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { ProductRecord } from '../types/crm';
import { productsData as defaultProductsData } from '../data/products';
import { getProductsFromDb, updateProductInDb } from '../services/crmService';

interface ProductContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  updateProduct: (id: string, updates: Partial<ProductRecord>) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function recordToProduct(r: ProductRecord): Product {
  const threeBenefits: [string, string, string] = Array.isArray(r.three_main_benefits) && r.three_main_benefits.length >= 3
    ? [r.three_main_benefits[0], r.three_main_benefits[1], r.three_main_benefits[2]]
    : Array.isArray(r.benefits) && r.benefits.length >= 3
    ? [r.benefits[0], r.benefits[1], r.benefits[2]]
    : ['Handcrafted in small batches', 'Pure cold process botanical formula', 'Retains natural vegetable glycerin'];

  return {
    id: r.id,
    name: r.product_name || r.id,
    category: (r.category as any) || 'Handmade Cold Process Soap',
    shortDescription: r.short_description || '',
    fullDescription: r.description || '',
    benefits: r.benefits || [],
    threeMainBenefits: threeBenefits,
    ingredients: r.ingredients || '',
    netWeightOrVol: r.weight_or_volume || '',
    mrp: Number(r.price) || 99,
    image: r.image_url || '/images/products/kesuda-palash-soap.webp',
    additionalImages: r.additional_images && r.additional_images.length > 0 ? r.additional_images : [r.image_url],
    howToUse: r.usage_instructions || '',
    isFeatured: Boolean(r.is_featured),
    skinType: r.skin_type || 'All Skin Types',
    availabilityStatus: r.availability_status || 'in_stock'
  };
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(defaultProductsData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await getProductsFromDb();
      if (records && records.length > 0) {
        const mapped = records.map(recordToProduct);
        setProducts(mapped);
      }
    } catch (err: any) {
      console.warn('Could not fetch products from database, retaining verified catalog:', err);
      setError('Authoritative catalogue could not be synced from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<ProductRecord>): Promise<boolean> => {
    try {
      await updateProductInDb(id, updates);
      // Immediately reflect update locally in context
      setProducts(prev =>
        prev.map(p => {
          if (p.id !== id) return p;
          return {
            ...p,
            name: updates.product_name !== undefined ? updates.product_name : p.name,
            mrp: updates.price !== undefined ? Number(updates.price) : p.mrp,
            availabilityStatus: updates.availability_status !== undefined ? updates.availability_status : p.availabilityStatus,
            shortDescription: updates.short_description !== undefined ? updates.short_description : p.shortDescription,
            fullDescription: updates.description !== undefined ? updates.description : p.fullDescription,
            ingredients: updates.ingredients !== undefined ? updates.ingredients : p.ingredients,
            isFeatured: updates.is_featured !== undefined ? updates.is_featured : p.isFeatured
          };
        })
      );
      return true;
    } catch (err) {
      console.error('Failed to update product in database:', err);
      return false;
    }
  }, []);

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        refreshProducts,
        updateProduct,
        getProductById
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductCatalog = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    // Graceful fallback if component renders outside provider
    return {
      products: defaultProductsData,
      isLoading: false,
      error: null,
      refreshProducts: async () => {},
      updateProduct: async () => false,
      getProductById: (id: string) => defaultProductsData.find(p => p.id === id)
    };
  }
  return context;
};
