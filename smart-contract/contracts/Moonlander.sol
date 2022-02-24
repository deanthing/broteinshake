// SPDX-License-Identifier: OPEN
pragma solidity ^0.8.4;


// dev dependency
import "hardhat/console.sol";


import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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

  uint256 private constant PRICE = 0.05 ether;
  uint256 private constant WHITELIST_PRICE= 0.04 ether;
  uint256 private constant FAR_FUTURE = 0xFFFFFFFFF;
  uint256 private constant MAX_MINTS_PER_TX = 5;
  uint256 private constant ON_WHITELIST = 10;
  uint256 private constant MAX_WHITELIST_MINTS = 1;

  uint256 public _maxSupply = 10000;
  uint256 private _publicSaleStart = FAR_FUTURE;
  uint256 private _whitelistSaleStart = FAR_FUTURE;
  string private _baseTokenURI;
  mapping(address => uint256) private _whitelist;
  event PublicSaleStart(uint256 price, uint256 supplyRemaining);
  event WhitelistStart(uint256 price, uint256 supplyRemaining);
  event SetWhitelist();
  event SalePaused();

  constructor() ERC721A("Moonlander", "MNLDR") {}

  // PRESALE WHITELIST

  function isWhitelistSaleActive() public view returns (bool) {
    return block.timestamp > _whitelistSaleStart;
  }

  // TODO: I don't get why this can be pure
  function getWhitelistPrice() public pure returns (uint256) {
    return WHITELIST_PRICE;
  }

  // whitelisters can only mint 1 token 
  function whitelistMint() external payable nonReentrant onlyEOA {
    if (!isWhitelistSaleActive())        revert SaleNotStarted();
    if (!isWhitelisted(msg.sender))      revert AccountNotWhitelisted();
    if (hasMintedPresale(msg.sender))    revert AmountExceedsWhitelistLimit();
    if (totalSupply() + 1 > _maxSupply
)  revert AmountExceedsSupply();
    if (getWhitelistPrice() != msg.value)revert IncorrectPayment();

    _whitelist[msg.sender] += 1;
    _safeMint(msg.sender, 1);
  }

  function hasMintedPresale(address account) public view returns (bool) {
    return _whitelist[account] == ON_WHITELIST + MAX_WHITELIST_MINTS;
  }

  // TODO: See if array lookup or mapping look up is more gas efficient
  function isWhitelisted(address account) public view returns (bool) {
    return _whitelist[account] == ON_WHITELIST; 
  }

  // PUBLIC SALE

  function isPublicSaleActive() public view returns (bool) {
    return block.timestamp > _publicSaleStart;
  }

  
  // TODO: I don't get why this can be pure
  function getPublicSalePrice() public pure returns (uint256) {
    return PRICE;
  }

  function publicSaleMint(uint256 quantity) external payable nonReentrant onlyEOA {
    if (!isPublicSaleActive())                  revert SaleNotStarted();
    if (totalSupply() + quantity > _maxSupply
)  revert AmountExceedsSupply();
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

  // TODO: this will need to be emitted as an event
  function getMintSummary() external view returns (MintSummary memory summary) {
     return MintSummary({
      isWhitelistSaleActive: isWhitelistSaleActive(),
      isPublicSaleActive: isPublicSaleActive(),
      getPublicSalePrice: getPublicSalePrice(),
      getWhitelistPrice: getWhitelistPrice(),
      maxSupply: _maxSupply
  ,
      totalSupply: totalSupply(),
      blockTime: block.timestamp
    });
  }

 

//  TODO: ER721Enumerable was removed 
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
        _whitelist[addresses[i]] = ON_WHITELIST;
    }
  }

  function startWhitelistSale() external onlyOwner {
    if (isWhitelistSaleActive()) revert SaleInProgress();

    _whitelistSaleStart = block.timestamp;

    emit PublicSaleStart(getWhitelistPrice(), _maxSupply
 - totalSupply());
  }

  function startPublicSale() external onlyOwner {
    if (isPublicSaleActive()) revert SaleInProgress();

    _publicSaleStart = block.timestamp;

    emit PublicSaleStart(getPublicSalePrice(), _maxSupply
 - totalSupply());
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

  function setMaxSupply(uint256 supply) external onlyOwner {
    _maxSupply = supply;
  }  


  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = super.tokenURI(tokenId);
        return bytes(uri).length > 0 ? string(abi.encodePacked(uri, ".json")) : "";
  }

   // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
  //       if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

  //       string memory baseURI = _baseURI();
  //       return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, Strings.toString(tokenId))) : '';
  // }


  // prob should remove hthis cause it takes O(number of minted items)
  function tokensOfOwner(address owner) external view returns (uint256[] memory) {
    unchecked {
        uint256[] memory a = new uint256[](balanceOf(owner)); 
        uint256 end = totalSupply();
        uint256 tokenIdsIdx;
        address currOwnershipAddr;
        for (uint256 i; i < end; i++) {
            TokenOwnership memory ownership = _ownerships[i];
            if (ownership.burned) {
                continue;
            }
            if (ownership.addr != address(0)) {
                currOwnershipAddr = ownership.addr;
            }
            if (currOwnershipAddr == owner) {
                a[tokenIdsIdx++] = i;
            }
        }
      return a;
    }
  }
}