import { useState, useEffect } from "react";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=";

export default function App() {
  const [coinInput, setCoinInput] = useState("");
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("myBags");
    return saved ? JSON.parse(saved) : [];
  });
  const [prices, setPrices] = useState({});

  useEffect(() => {
    localStorage.setItem("myBags", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    if (portfolio.length === 0) return;
    const ids = portfolio.map((coin) => coin.id).join(",");
    fetch(COINGECKO_API + ids)
      .then((res) => res.json())
      .then((data) => setPrices(data));
  }, [portfolio]);

  const addCoin = async () => {
    if (!coinInput) return;
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinInput}`);
      if (!res.ok) throw new Error("Coin not found");
      const data = await res.json();
      const coin = {
        id: data.id,
        name: data.name,
        quantity: 1,
      };
      setPortfolio((prev) => [...prev, coin]);
      setCoinInput("");
    } catch (err) {
      alert("Coin not found");
    }
  };

  const updateQuantity = (id, quantity) => {
    setPortfolio((prev) =>
      prev.map((coin) => (coin.id === id ? { ...coin, quantity } : coin))
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">my bags</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="bg-white text-black px-2 py-1 rounded w-full"
          placeholder="Enter coin id (e.g. bitcoin)"
          value={coinInput}
          onChange={(e) => setCoinInput(e.target.value.toLowerCase())}
        />
        <button
          className="bg-green-500 px-4 py-2 rounded text-white font-bold"
          onClick={addCoin}
        >
          +
        </button>
      </div>
      <div className="grid gap-4">
        {portfolio.map((coin) => (
          <div key={coin.id} className="bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-semibold">{coin.name}</div>
                <div className="text-sm text-gray-400">
                  Quantity:{" "}
                  <input
                    type="number"
                    min="0"
                    value={coin.quantity}
                    onChange={(e) =>
                      updateQuantity(coin.id, parseFloat(e.target.value))
                    }
                    className="bg-gray-700 text-white w-20 ml-1 rounded px-1"
                  />
                </div>
              </div>
              <div className="text-right">
                <div>${prices[coin.id]?.usd?.toFixed(2) ?? "-"}</div>
                <div className="text-sm text-green-400">
                  ${(prices[coin.id]?.usd * coin.quantity || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
