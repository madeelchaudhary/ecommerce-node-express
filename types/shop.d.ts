export interface Product {
  readonly id: string;
  title: string;
  image: string;
  description: string;
  price: number;
  label: "Featured" | "New";
  category: string;
  brand: string;
}
