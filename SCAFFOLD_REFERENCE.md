# Scaffold-ETH Hooks & Utils Reference

This document catalogs all available hooks and utilities in our Integra DApp built on Scaffold-ETH.

## 🪝 Available Hooks

### Contract Interaction Hooks

#### `useScaffoldReadContract`
Read data from deployed contracts.
```typescript
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const { data: balance } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "getBalance",
  args: [address],
});
```

#### `useScaffoldWriteContract`
Write to deployed contracts (transactions).
```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const { writeContractAsync } = useScaffoldWriteContract("YourContract");

const handleTransaction = async () => {
  await writeContractAsync({
    functionName: "transfer",
    args: [recipient, amount],
  });
};
```

#### `useScaffoldWatchContractEvent`
Listen to contract events in real-time.
```typescript
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

useScaffoldWatchContractEvent({
  contractName: "YourContract",
  eventName: "Transfer",
  onLogs: (logs) => {
    console.log("Transfer events:", logs);
  },
});
```

#### `useScaffoldEventHistory`
Get historical contract events.
```typescript
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const { data: events, isLoading } = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "Transfer",
  fromBlock: 0n,
});
```

#### `useScaffoldContract`
Get contract instance for advanced usage.
```typescript
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const { data: contract } = useScaffoldContract({
  contractName: "YourContract",
});
```

#### `useDeployedContractInfo`
Get deployed contract information.
```typescript
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const { data: contractInfo } = useDeployedContractInfo("YourContract");
```

#### `useContractLogs`
Fetch contract logs with filtering.
```typescript
import { useContractLogs } from "~~/hooks/scaffold-eth";

const { data: logs } = useContractLogs({
  contractAddress: "0x...",
  event: "Transfer",
  fromBlock: 0n,
});
```

### Network & Wallet Hooks

#### `useTargetNetwork`
Get current target network information.
```typescript
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const { targetNetwork } = useTargetNetwork();
console.log(targetNetwork.name); // "Ethereum", "Polygon", etc.
```

#### `useWatchBalance`
Monitor wallet balance changes.
```typescript
import { useWatchBalance } from "~~/hooks/scaffold-eth";

const { data: balance, isLoading } = useWatchBalance({
  address: walletAddress,
});
```

#### `useNetworkColor`
Get network-specific color for UI theming.
```typescript
import { useNetworkColor } from "~~/hooks/scaffold-eth";

const networkColor = useNetworkColor();
```

#### `useSelectedNetwork`
Get currently selected network.
```typescript
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

const selectedNetwork = useSelectedNetwork();
```

### UI Helper Hooks

#### `useCopyToClipboard`
Copy text to clipboard with feedback.
```typescript
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";

const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

const handleCopy = () => {
  copyToClipboard("Text to copy");
};
```

#### `useOutsideClick`
Detect clicks outside an element.
```typescript
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const ref = useRef(null);
useOutsideClick(ref, () => {
  console.log("Clicked outside!");
});
```

#### `useAnimationConfig`
Animation configuration for UI components.
```typescript
import { useAnimationConfig } from "~~/hooks/scaffold-eth";

const { showAnimation } = useAnimationConfig(balance);
```

#### `useDisplayUsdMode`
Toggle between ETH and USD display.
```typescript
import { useDisplayUsdMode } from "~~/hooks/scaffold-eth";

const { displayUsdMode, toggleDisplayUsdMode } = useDisplayUsdMode();
```

### Price & Data Hooks

#### `useInitializeNativeCurrencyPrice`
Initialize native currency price tracking.
```typescript
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";

useInitializeNativeCurrencyPrice();
```

#### `useFetchBlocks`
Fetch blockchain blocks (for block explorer).
```typescript
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

const { blocks, transactionReceipts, currentPage, totalBlocks } = useFetchBlocks();
```

#### `useTransactor`
Transaction handling with notifications.
```typescript
import { useTransactor } from "~~/hooks/scaffold-eth";

const writeTx = useTransactor();

const handleTransaction = async () => {
  await writeTx(() => writeContractAsync({
    functionName: "transfer",
    args: [recipient, amount],
  }));
};
```

## 🛠️ Available Utils

### Network Utilities

#### `getTargetNetworks()`
Get all configured target networks.
```typescript
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();
```

#### `getBlockExplorerTxLink(chainId, txHash)`
Generate block explorer transaction URL.
```typescript
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

const explorerUrl = getBlockExplorerTxLink(1, "0x123...");
```

#### `getBlockExplorerAddressLink(network, address)`
Generate block explorer address URL.
```typescript
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const explorerUrl = getBlockExplorerAddressLink(network, "0x123...");
```

### Price Utilities

#### `fetchPriceFromUniswap(token)`
Fetch token price from Uniswap.
```typescript
import { fetchPriceFromUniswap } from "~~/utils/scaffold-eth";

const price = await fetchPriceFromUniswap({
  contractAddress: "0x...",
  decimals: 18,
});
```

### Error Handling

#### `getParsedError(error)`
Parse and format contract errors.
```typescript
import { getParsedError } from "~~/utils/scaffold-eth";

try {
  await writeContract();
} catch (error) {
  const parsedError = getParsedError(error);
  console.log(parsedError);
}
```

### Transaction Utilities

#### `decodeTxData(data)`
Decode transaction data.
```typescript
import { decodeTxData } from "~~/utils/scaffold-eth";

const decoded = decodeTxData("0x...");
```

### Notifications

#### `notification`
Toast notification system.
```typescript
import { notification } from "~~/utils/scaffold-eth";

// Success notification
notification.success("Transaction successful!");

// Error notification
notification.error("Transaction failed!");

// Info notification
notification.info("Processing...");

// Warning notification
notification.warning("Please check your input");

// Custom notification with JSX
notification.success(
  <>
    <p className="font-bold">Success!</p>
    <p>Your transaction was confirmed</p>
  </>
);
```

### Block Utilities

#### Block-related utilities
```typescript
import { formatTimeToNow, getBlockExplorerTxURL } from "~~/utils/scaffold-eth";

// Format time relative to now
const timeAgo = formatTimeToNow(timestamp);

// Get block explorer URL
const explorerUrl = getBlockExplorerTxURL(txHash);
```

## 📝 Usage Tips

1. **Always handle loading states** when using data hooks
2. **Use try-catch blocks** with write operations
3. **Implement proper error handling** with `getParsedError`
4. **Leverage notifications** for user feedback
5. **Use network colors** for consistent theming
6. **Monitor events** for real-time updates

## 🎨 Styling Integration

All hooks work seamlessly with:
- **DaisyUI components** for consistent styling
- **Tailwind CSS** for custom styling
- **Network-specific theming** via `useNetworkColor`

## 🔗 Quick Reference

Most commonly used hooks for marketplace functionality:
- `useScaffoldReadContract` - Read marketplace data
- `useScaffoldWriteContract` - Execute marketplace transactions
- `useScaffoldWatchContractEvent` - Listen to marketplace events
- `useTargetNetwork` - Network information
- `notification` - User feedback
- `useCopyToClipboard` - Copy addresses/transaction hashes