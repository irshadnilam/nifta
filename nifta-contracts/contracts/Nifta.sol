// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Nifta is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    // Struct to store the details of an NFT listing
    struct NFTListingDetail {
        bool isListed;
        uint256 price;
        address lastOwner;
        SaleDetail[] salesHistory;
    }

    // Struct to store the details of an NFT sale
    struct SaleDetail {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }

    // The owner of the contract
    address public marketOwner;

    // Mapping from NFT token ID to the price of the NFT
    mapping(uint256 => NFTListingDetail) public nftDetails;

    mapping(address => uint256[]) public nftsListedByUser;

    // NFTs listed for sale
    uint256[] public nftsListedInMarket;

    // Event emitted when an NFT is listed for sale
    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    // Event emitted when an NFT is bought
    event NFTBought(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    // Event emitted when a listing is cancelled
    event NFTListingCancelled(uint256 indexed tokenId, address indexed seller);

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Nifta", "NIFTA") {
        _tokenIdCounter.increment(); // Start tokenIds from 1
    }

    // Function to mint an NFT
    function safeMint(address to, string memory uri) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Function to list an NFT for sale
    function listNFT(uint256 tokenId, uint256 price) external {
        // Check if the NFT is already listed
        require(!nftDetails[tokenId].isListed, "Nifta: NFT already listed");

        // Check if the user is the owner of the NFT
        require(ownerOf(tokenId) == msg.sender, "Nifta: Not the owner");

        // Check if the price is greater than zero
        require(price > 0, "Nifta: Price must be greater than zero");

        // Set the listing status to "listed"
        nftDetails[tokenId].isListed = true;

        // Set the price of the NFT
        nftDetails[tokenId].price = price;

        // Set the last owner of the NFT
        nftDetails[tokenId].lastOwner = msg.sender;

        // Approve the contract to transfer the NFT
        _transfer(msg.sender, address(this), tokenId);

        // Add the NFT to the list of NFTs listed by the user
        nftsListedByUser[msg.sender].push(tokenId);

        // Add the NFT to the list of NFTs listed for sale
        nftsListedInMarket.push(tokenId);

        // Emit an event
        emit NFTListed(tokenId, msg.sender, price);
    }

    // Function to buy an NFT
    function purchase(uint256 tokenId) external payable {
        // Check if the listing status is "listed"
        require(nftDetails[tokenId].isListed, "Nifta: NFT not listed");

        uint256 price = nftDetails[tokenId].price;

        // Check if the user has enough TFUEL to pay for the NFT
        require(msg.value >= price, "Nifta: Insufficient funds");

        address seller = nftDetails[tokenId].lastOwner;
        address buyer = msg.sender;

        // Transfer the NFT to the buyer
        _transfer(address(this), buyer, tokenId);

        // Pay the seller
        payable(seller).transfer(msg.value);

        // Set the listing status false
        nftDetails[tokenId].isListed = false;

        // Add the sale details to the sales history
        nftDetails[tokenId].salesHistory.push(
            SaleDetail(tokenId, seller, buyer, price, block.timestamp)
        );

        // Remove the NFT from the list of NFTs listed for sale
        for (uint256 i = 0; i < nftsListedByUser[seller].length; i++) {
            if (nftsListedByUser[seller][i] == tokenId) {
                nftsListedByUser[seller][i] = nftsListedInMarket[
                    nftsListedByUser[seller].length - 1
                ];
                nftsListedByUser[seller].pop();
                break;
            }
        }

        // Change the last owner of the NFT
        nftDetails[tokenId].lastOwner = buyer;

        // Remove the NFT from the list of NFTs listed for sale
        // TODO: Optimize this
        for (uint256 i = 0; i < nftsListedInMarket.length; i++) {
            if (nftsListedInMarket[i] == tokenId) {
                nftsListedInMarket[i] = nftsListedInMarket[
                    nftsListedInMarket.length - 1
                ];
                nftsListedInMarket.pop();
                break;
            }
        }

        nftDetails[tokenId].lastOwner = buyer;
        // Emit an event
        emit NFTBought(tokenId, buyer, seller, price);
    }

    // Function to cancel a listing
    function cancelListing(uint256 tokenId) external {
        address owner = nftDetails[tokenId].lastOwner;

        // Check if the listing status is "listed"
        require(nftDetails[tokenId].isListed, "Nifta: NFT not listed");

        // Check if the user is the owner of the NFT
        require(owner == msg.sender, "Nifta: Not the owner");

        // Set the listing status to "not listed"
        nftDetails[tokenId].isListed = false;

        // Transfer the NFT to the owner
        _transfer(address(this), owner, tokenId);

        // Remove the NFT from the list of NFTs listed for sale
        for (uint256 i = 0; i < nftsListedByUser[owner].length; i++) {
            if (nftsListedByUser[owner][i] == tokenId) {
                nftsListedByUser[owner][i] = nftsListedInMarket[
                    nftsListedByUser[owner].length - 1
                ];
                nftsListedByUser[owner].pop();
                break;
            }
        }

        // Remove the NFT from the list of NFTs listed for sale
        // TODO: Optimize this
        for (uint256 i = 0; i < nftsListedInMarket.length; i++) {
            if (nftsListedInMarket[i] == tokenId) {
                nftsListedInMarket[i] = nftsListedInMarket[
                    nftsListedInMarket.length - 1
                ];
                nftsListedInMarket.pop();
                break;
            }
        }

        // Emit an event
        emit NFTListingCancelled(tokenId, msg.sender);
    }

    // Function to get token ids of the NFTs owned by a user
    function getNFTsOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);

        uint256[] memory tokenIds = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokenIds;
    }

    // Function to get the sales history of an NFT
    function getSalesHistory(
        uint256 tokenId
    ) external view returns (SaleDetail[] memory) {
        return nftDetails[tokenId].salesHistory;
    }

    // Get NFTs listed for sale
    function getNFTsListedForSale() external view returns (uint256[] memory) {
        return nftsListedInMarket;
    }

    // Get NFTs listed by a user
    function getNFTsListedByUser(
        address user
    ) external view returns (uint256[] memory) {
        return nftsListedByUser[user];
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
