export const MARKETPLACE_ABI = [
  // Core functions that we know work
  "function owner() view returns (address)",
  "function getSaleArray(uint256 from, uint256 count) view returns (tuple(uint256 liquidId, address seller, uint8 sellType, bool isActive, uint256 createdAt, address paymentToken, bool acceptsNativePlume, uint256 fixedPrice, uint256 startingPrice, uint256 currentBid, address currentBidder, uint256 endTime, uint256 bidIncrement, uint256 reservePrice)[])",
  "function getSale(uint256 liquidId) view returns (tuple(uint256 liquidId, address seller, uint8 sellType, bool isActive, uint256 createdAt, address paymentToken, bool acceptsNativePlume, uint256 fixedPrice, uint256 startingPrice, uint256 currentBid, address currentBidder, uint256 endTime, uint256 bidIncrement, uint256 reservePrice))",
  "function getActiveOffers(uint256 liquidId) view returns (tuple(uint256 liquidId, address buyer, uint256 amount, uint256 expiresAt, bool isActive, address paymentToken, bool isNativePlume)[])",
  "function getOffers(uint256 liquidId) view returns (tuple(uint256 liquidId, address buyer, uint256 amount, uint256 expiresAt, bool isActive, address paymentToken, bool isNativePlume)[])",
  "function withdrawExpiredOffer(uint256 liquidId, uint256 offerIndex)",
  "function endAuctionSale(uint256 liquidId)",
  "function buyFixedPriceSale(uint256 liquidId)",
  "function placeBid(uint256 liquidId, uint256 bidAmount)",
  "function makeOffer(uint256 liquidId, uint256 amount, uint256 expirationTime)",
  "function acceptOffer(uint256 liquidId, uint256 offerIndex)",
  "function cancelSale(uint256 liquidId)",
  "function createFixedPriceSale(uint256 liquidId, uint256 price, address paymentToken, bool acceptsNativePlume)",
  "function createAuctionSale(uint256 liquidId, uint256 startingPrice, uint256 reservePrice, uint256 duration, uint256 bidIncrement, address paymentToken, bool acceptsNativePlume)",
  
  // Events
  "event SaleCreated(uint256 indexed liquidId, address indexed seller, uint8 sellType, uint256 price, address paymentToken, bool acceptsNativePlume)",
  "event SaleCompleted(uint256 indexed liquidId, address indexed seller, address indexed buyer, uint256 price, uint8 sellType, bool paidWithNativePlume)",
  "event SaleCancelled(uint256 indexed liquidId, address indexed seller, uint8 sellType)",
  "event OfferMade(uint256 indexed liquidId, address indexed buyer, uint256 offerIndex, uint256 amount, address paymentToken, uint256 expiresAt, bool isNativePlume)",
  "event OfferAccepted(uint256 indexed liquidId, address indexed seller, address indexed buyer, uint256 offerIndex, uint256 amount, bool paidWithNativePlume)",
  "event OfferCancelled(uint256 indexed liquidId, address indexed buyer, uint256 offerIndex)",
  "event BidPlaced(uint256 indexed liquidId, address indexed bidder, uint256 amount, uint256 newEndTime)",
  "event AuctionEnded(uint256 indexed liquidId, address indexed winner, uint256 finalBid, bool reserveMet)"
];

export const MARKETPLACE_ADDRESS = "0x9ea7392980F09fa7A087efe152285A519cE52E8F"; 