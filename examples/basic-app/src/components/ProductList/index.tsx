import ProductCard from '../Card';
import CardContainer from '../CardContainer';

export const ProductList = (props: { products: any[] }) => {
  return (
    <CardContainer>
      {props.products.map((p, i) => (
        <ProductCard key={i} {...p} />
      ))}
    </CardContainer>
  );
};

export default ProductList;
