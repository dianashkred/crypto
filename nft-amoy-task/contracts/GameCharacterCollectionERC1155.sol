// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCharacterCollectionERC1155 is ERC1155URIStorage, Ownable {
    uint256 public constant CHARACTER_COUNT = 10;

    struct CharacterMeta {
        string image;
        string attr1Name;
        string attr1Value;
        string attr2Name;
        string attr2Value;
    }

    mapping(uint256 => CharacterMeta) public characterMeta;

    error InvalidId();

    constructor() ERC1155("") Ownable(msg.sender) {}

    function setCharacter(
        uint256 id,
        string calldata tokenUri,
        string calldata image,
        string calldata attr1Name,
        string calldata attr1Value,
        string calldata attr2Name,
        string calldata attr2Value
    ) external onlyOwner {
        if (id < 1 || id > CHARACTER_COUNT) revert InvalidId();

        _setURI(id, tokenUri);
        characterMeta[id] = CharacterMeta({
            image: image,
            attr1Name: attr1Name,
            attr1Value: attr1Value,
            attr2Name: attr2Name,
            attr2Value: attr2Value
        });
    }

    function batchSetupCharacters(
        uint256[] calldata ids,
        string[] calldata tokenUris,
        string[] calldata images,
        string[] calldata attr1Names,
        string[] calldata attr1Values,
        string[] calldata attr2Names,
        string[] calldata attr2Values
    ) external onlyOwner {
        uint256 n = ids.length;

        require(
            n == tokenUris.length &&
            n == images.length &&
            n == attr1Names.length &&
            n == attr1Values.length &&
            n == attr2Names.length &&
            n == attr2Values.length,
            "Length mismatch"
        );

        for (uint256 i = 0; i < n; i++) {
            uint256 id = ids[i];
            if (id < 1 || id > CHARACTER_COUNT) revert InvalidId();

            _setURI(id, tokenUris[i]);
            characterMeta[id] = CharacterMeta({
                image: images[i],
                attr1Name: attr1Names[i],
                attr1Value: attr1Values[i],
                attr2Name: attr2Names[i],
                attr2Value: attr2Values[i]
            });
        }
    }

    function mintBatchTo(address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            if (id < 1 || id > CHARACTER_COUNT) revert InvalidId();
        }
        _mintBatch(to, ids, amounts, data);
    }
}
