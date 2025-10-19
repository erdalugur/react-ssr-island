function getRandomTitle(index: number) {
  return `Denim Jeans ${index}`;
}

function getRandomDescription() {
  return 'Some text about the jeans. Super slim and comfy lorem ipsum lorem jeansum. Lorem jeamsun denim lorem jeansum.';
}

export function getProducts(count = 100) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      title: getRandomTitle(i),
      description: getRandomDescription(),
      img: '/w3images/jeans3.jpg',
      price: 5500
    });
  }
  return Promise.resolve(items);
}

export async function getProductById(id: string) {
  const products = await getProducts();
  return products.find((x) => x.id.toString() === id);
}
