export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  image_url: string | null;
  products_count: number;
  parent: number | null;
  parent_name?: string | null;
  parent_slug?: string | null;
  is_active?: boolean;
  children: Category[];
};

export type CategoryListResponse =
  | Category[]
  | {
      count: number;
      next: string | null;
      previous: string | null;
      results: Category[];
    };