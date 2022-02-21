// SPDX-License-Identifier: OPEN
pragma solidity ^0.8.4;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// TODO: adding lots of addresses to list will hav high gas costs.
// https://www.youtube.com/watch?v=j0S6Izd_H4k
// https://www.reddit.com/r/ethdev/comments/rbs2ek/checking_if_someone_is_whitelisted_on_mint/

error SaleNotStarted();
error SaleInProgress();
error InsufficientPayment();
error IncorrectPayment();
error AccountNotWhitelisted();
error AmountExceedsSupply();
error AmountExceedsWhitelistLimit();
error AmountExceedsTransactionLimit();
error OnlyExternallyOwnedAccountsAllowed();

contract Moonlander is ERC721A, ReentrancyGuard, Ownable {

  uint256 public constant MAX_SUPPLY = 10000;
  uint256 private constant PRICE = 0.5 ether;
  uint256 private constant WHITELIST_PRICE= 0.4 ether;
  uint256 private constant FAR_FUTURE = 0xFFFFFFFFF;
  uint256 private constant MAX_MINTS_PER_TX = 5;

  uint256 private _publicSaleStart = FAR_FUTURE;
  uint256 private _whitelistSaleStart = FAR_FUTURE;
  string private _baseTokenURI;
  mapping(address => int) private _whitelist;
  event PublicSaleStart(uint256 price, uint256 supplyRemaining);
  event WhiteListStart(uint256 price, uint256 supplyRemaining);
  event SetWhitelist();
  event SalePaused();

  constructor() ERC721A("Moonlander", "MNLDR") {}

  // PRESALE WHITELIST

  function isWhitelistSaleActive() public view returns (bool) {
    return block.timestamp > _whitelistSaleStart;
  }

  function getWhitelistPrice() public view returns (uint256) {
    return WHITELIST_PRICE;
  }

  // whitelisters can only mint 1 token
  function whiteListMint() external payable nonReentrant onlyEOA {
    if (!isWhitelistSaleActive())        revert SaleNotStarted();
    if (!isWhitelisted(msg.sender))      revert AccountNotWhitelisted();
    if (hasMintedPresale(msg.sender))    revert AmountExceedsWhitelistLimit();
    if (totalSupply() + 1 > MAX_SUPPLY)  revert AmountExceedsSupply();
    if (getWhitelistPrice() != msg.value)revert IncorrectPayment();

    _whitelist[msg.sender] += 1;
    _safeMint(msg.sender, 1);
  }

  function hasMintedPresale(address account) public view returns (bool) {
    return _whitelist[account] == 1;
  }

  // TODO: See if array lookup or mapping look up is more gas efficient
  function isWhitelisted(address account) internal view returns (bool) {
    return _whitelist[account] == 0; 
  }

  // PUBLIC SALE

  function isPublicSaleActive() public view returns (bool) {
    return block.timestamp > _publicSaleStart;
  }

  
  function getPublicSalePrice() public view returns (uint256) {
    return PRICE;
  }

  function publicSaleMint(uint256 quantity) external payable nonReentrant onlyEOA {
    if (!isPublicSaleActive())                  revert SaleNotStarted();
    if (totalSupply() + quantity > MAX_SUPPLY)  revert AmountExceedsSupply();
    if (getPublicSalePrice() * quantity != msg.value) revert IncorrectPayment();
    if (quantity > MAX_MINTS_PER_TX)            revert AmountExceedsTransactionLimit();

    _safeMint(msg.sender, quantity);
  }

  // METADATA

  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  function setBaseURI(string calldata baseURI) external onlyOwner {
    _baseTokenURI = baseURI;
  }

  // WEBSITE HELPERS
  struct MintSummary {
    bool isPublicSaleActive; bool isWhitelistSaleActive;
    uint256 getPublicSalePrice; uint256 getWhitelistPrice; uint256 blockTime;
    uint256 maxSupply; uint256 totalSupply;
  }

  function getMintSummary() external view returns (MintSummary memory summary) {
     return MintSummary({
      isWhitelistSaleActive: isWhitelistSaleActive(),
      isPublicSaleActive: isPublicSaleActive(),
      getPublicSalePrice: getPublicSalePrice(),
      getWhitelistPrice: getWhitelistPrice(),
      maxSupply: MAX_SUPPLY,
      totalSupply: totalSupply(),
      blockTime: block.timestamp
    });
  }

//TODO: ER721Enumerable was removed 
//   function tokensOf(address owner) public view returns (uint256[] memory){
//     uint256 count = balanceOf(owner);
//     uint256[] memory tokenIds = new uint256[](count);
//     for (uint256 i; i < count; i++) {
//       tokenIds[i] = tokenOfOwnerByIndex(owner, i);
//     }
//     return tokenIds;
//   }

  // OWNERS + HELPERS

  function setWhitelist(address[] calldata addresses) external onlyOwner {
    for (uint256 i = 0; i < addresses.length; i++) {
        _whitelist[addresses[i]] = 0;
    }
  }

  function startWhiteListSale() external onlyOwner {
    if (isWhitelistSaleActive()) revert SaleInProgress();

    _whitelistSaleStart = block.timestamp;

    emit PublicSaleStart(getPublicSalePrice(), MAX_SUPPLY - totalSupply());
  }

  function startPublicSale() external onlyOwner {
    if (isPublicSaleActive()) revert SaleInProgress();

    _publicSaleStart = block.timestamp;

    emit PublicSaleStart(getPublicSalePrice(), MAX_SUPPLY - totalSupply());
  }

  function pauseSale() external onlyOwner {
    _whitelistSaleStart = FAR_FUTURE;
    _publicSaleStart = FAR_FUTURE;

    emit SalePaused();
  }

  modifier onlyEOA() {
    if (tx.origin != msg.sender) revert OnlyExternallyOwnedAccountsAllowed();
    _;
  }

  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }
}