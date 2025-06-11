export async function fetchSolPrice(): Promise<number> {
  const res = await fetch(
    "https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112"
  );
  const data = await res.json();
  return parseFloat(
    data.data["So11111111111111111111111111111111111111112"].price
  );
}
