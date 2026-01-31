# NFT Assignment — ERC-721 & ERC-1155

Network:  
Polygon Amoy (testnet)

---

## Proof of functionality

- ERC-721 soulbound mint (student visit card):  
  Student wallet:  
  0x4811f3fa515d597a2Cf27e5887d2d93Cde2a2e60

- ERC-1155 batch mint (10 token IDs) to deployer:  
  Deployer wallet:  
  0x1be624Fbc61a0052F2aD32414859E665c5B92815

- ERC-1155 batch transfer (token IDs 1, 2) to student wallet:  
  0x4811f3fa515d597a2Cf27e5887d2d93Cde2a2e60

PolygonScan (Amoy):
- https://amoy.polygonscan.com/address/0x4811f3fa515d597a2Cf27e5887d2d93Cde2a2e60
- https://amoy.polygonscan.com/address/0x1be624Fbc61a0052F2aD32414859E665c5B92815

---

## Notes

- Both contracts use OpenZeppelin implementations.
- ERC-721 transfers and approvals are disabled (soulbound).
- ERC-1155 supports batch minting and batch transfers.
- Metadata is stored off-chain and referenced via tokenURI / uri.
