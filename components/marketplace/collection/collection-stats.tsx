interface Stats {
  traded: string
  players: string
  listed: string
  floorPrice: string
}

interface CollectionStatsProps {
  stats: Stats
}

export default function CollectionStats({ stats }: CollectionStatsProps) {
  return (
    <section className="py-8 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 border py-4 px-16 rounded-lg border-gray-700 w-fit mx-auto">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm text-gray-400">Traded</div>
            <div className="text-2xl font-bold">{stats.traded}</div>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm text-gray-400">Players</div>
            <div className="text-2xl font-bold">{stats.players}</div>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm text-gray-400">Volume</div>
            <div className="text-2xl font-bold">{stats.listed}</div>
          </div>

          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm text-gray-400">Vol.(PUSD)</div>
            <div className="text-2xl font-bold">{stats.floorPrice}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
