'use client'
import CollectionHero from "@/components/marketplace/collection/collection-hero";
import CollectionStats from "@/components/marketplace/collection/collection-stats";
import CollectionContent from "@/components/marketplace/collection/collection-content";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CollectionDetailsPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch collection data
        const collectionRes = await fetch(`/api/collections?id=${id}`);
        if (!collectionRes.ok) throw new Error("Collection not found");
        const { collection } = await collectionRes.json();
        setCollection(collection);

        // Fetch collection stats
        const statsRes = await fetch(`/api/collections/${id}/stats`);
        if (statsRes.ok) {
          const { stats } = await statsRes.json();
          setStats(stats);
        } else {
          // Fallback to default stats if API fails
          setStats({
            traded: "0",
            players: "0",
            listed: "0",
            floorPrice: "0",
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="py-12 text-center text-gray-400">Loading collection...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!collection) return <div className="py-12 text-center text-gray-400">Collection not found.</div>;

  return (
    <div className="min-h-screen bg-black">
      <CollectionHero collection={{
        id: collection._id,
        name: collection.name,
        description: collection.description,
        verified: collection.verified,
        bannerImage: collection.bannerUrl,
        avatarImage: collection.logoUrl,
      }} />
      <div className="container mx-auto px-4 -mt-24">
        <div className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center mt-8">
            <CollectionStats stats={stats || {
              traded: "0",
              players: "0",
              listed: "0",
              floorPrice: "0",
            }} />
          </div>
        </div>
        <div className="mt-12">
          <CollectionContent collectionId={id as string} />
        </div>
      </div>
    </div>
  );
} 