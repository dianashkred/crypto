// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundVisitCardERC721 is ERC721, Ownable {
    uint256 private _nextTokenId;

    mapping(address => uint256) public tokenOfStudent;
    mapping(uint256 => string) private _tokenURIs;

    error Soulbound();
    error AlreadyMinted();
    error NonexistentToken();

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {
        _nextTokenId = 1;
    }

    function mintToStudent(
        address student,
        string calldata tokenUri
    ) external onlyOwner returns (uint256) {
        if (tokenOfStudent[student] != 0) revert AlreadyMinted();

        uint256 tokenId = _nextTokenId++;
        tokenOfStudent[student] = tokenId;
        _tokenURIs[tokenId] = tokenUri;

        _safeMint(student, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert NonexistentToken();
        return _tokenURIs[tokenId];
    }

    /// @dev Core soulbound logic for OZ v5
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Block transfers: allow only minting (from == 0) and burning (to == 0)
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }

        return super._update(to, tokenId, auth);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
