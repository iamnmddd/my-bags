import { useEffect, useState } from "react";
import { GripVertical, MoreVertical } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Select from "react-select";
import numeral from "numeral";

const COINGECKO_LIST = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1";
const COINGECKO_PRICE =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd%2Cusd_24h_change&ids=";
const COINGECKO_LOGO =
  "https://api.coingecko.com/api/v3/coins/";

export default function App() {
  const [coinList, setCoinList] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem("yourBags");
    return saved ? JSON.parse(saved) : [];
  });
  const [prices, setPrices] = useState({});
  const [logos, setLogos] = useState({});
  const [btcMarketCap, setBtcMarketCap] = useState(null);
  const [btcDominance, setBtcDominance] = useState(null);

  useEffect(() => {
    fetch(COINGECKO_LIST)
      .then((res) => res.json())
      .then((data) => {
        setCoinList(data);
        const btc = data.find((coin) => coin.id === "bitcoin");
        if (btc) {
          setBtcMarketCap(btc.market_cap);
          setBtcDominance((btc.market_cap / data.reduce((acc, c) => acc + c.market_cap, 0)) * 100);
        }
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("yourBags", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    if (portfolio.length === 0) return;
    const ids = portfolio.map((coin) => coin.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h,7d,30d`)
      .then((res) => res.json())
      .then((data) => {
        const priceMap = {};
        data.forEach((coin) => {
          priceMap[coin.id] = coin;
        });
        setPrices(priceMap);
      });

    Promise.all(
      portfolio.map((coin) =>
        fetch(COINGECKO_LOGO + coin.id)
          .then((res) => res.json())
          .then((data) => ({ id: coin.id, logo: data.image.small }))
      )
    ).then((results) => {
      const logosMap = {};
      results.forEach(({ id, logo }) => {
        logosMap[id] = logo;
      });
      setLogos(logosMap);
    });
  }, [portfolio]);

  const addCoin = () => {
    if (!selectedCoin) return;
    if (portfolio.some((coin) => coin.id === selectedCoin.value)) return;
    const newCoin = {
      id: selectedCoin.value,
      name: selectedCoin.label,
    };
    setPortfolio([...portfolio, newCoin]);
    setSelectedCoin(null);
  };

  const deleteCoin = (id) => {
    setPortfolio((prev) => prev.filter((coin) => coin.id !== id));
  };

  const options = coinList
    .sort((a, b) => b.market_cap - a.market_cap)
    .map((coin) => ({
      value: coin.id,
      label: `${coin.name} (${coin.symbol.toUpperCase()})`,
    }));

  function SortableItem({ coin }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: coin.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const data = prices[coin.id];
    if (!data) return null;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white text-black p-4 rounded-lg shadow-md w-full"
      >
        <div className="grid grid-cols-[48px_1fr_auto_auto_32px] items-center gap-2 w-full">
          <img src={logos[coin.id]} alt="logo" className="w-10 h-10 rounded-full" />
          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
            <div className="font-bold text-lg">{data.name} ({data.symbol.toUpperCase()})</div>
          </div>
          <div className="text-sm space-y-1 text-center">
            <div className={data.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>24h: {numeral(data.price_change_percentage_24h / 100).format("+0%")}</div>
            <div className={data.price_change_percentage_7d_in_currency >= 0 ? "text-green-500" : "text-red-500"}>7d: {numeral(data.price_change_percentage_7d_in_currency / 100).format("+0%")}</div>
            <div className={data.price_change_percentage_30d_in_currency >= 0 ? "text-green-500" : "text-red-500"}>30d: {numeral(data.price_change_percentage_30d_in_currency / 100).format("+0%")}</div>
          </div>
          <div className="text-lg font-semibold text-right whitespace-nowrap">
            {numeral(data.current_price).format("$0,0")}
          </div>
          <button onClick={() => deleteCoin(coin.id)} className="text-gray-500">
            <MoreVertical />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-2 uppercase">YOUR BAGZ</h1>
      {btcMarketCap && (
        <div className="text-2xl font-semibold mb-2 text-green-600">
          {numeral(btcMarketCap).format("$0.00a").toUpperCase()} - {Math.round(btcDominance)}%
        </div>
      )}
      <div className="flex gap-2 w-full max-w-md mb-6">
        <div className="flex-grow">
          <Select
            options={options}
            value={selectedCoin}
            onChange={setSelectedCoin}
            placeholder="Search for a coin..."
          />
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white font-bold"
          onClick={addCoin}
        >
          +
        </button>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (active.id !== over?.id) {
            const oldIndex = portfolio.findIndex((c) => c.id === active.id);
            const newIndex = portfolio.findIndex((c) => c.id === over?.id);
            setPortfolio(arrayMove(portfolio, oldIndex, newIndex));
          }
        }}
      >
        <SortableContext
          items={portfolio.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4 w-full max-w-md">
            {portfolio.map((coin) => (
              <SortableItem key={coin.id} coin={coin} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
