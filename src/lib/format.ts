export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price)) + ' KGS';
}
