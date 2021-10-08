import {
  ETHSignTx,
  BTCSignTx,
  HDWallet,
  ThorchainSignTx,
  BTCInputScriptType
} from '@shapeshiftoss/hdwallet-core'

// asset-service

type AbstractAsset = {
  chain: ChainTypes
  network: NetworkTypes
  symbol: string
  name: string
  precision: number
  slip44: number
  color: string
  secondaryColor: string
  icon: string
  explorer: string
  explorerTxLink: string
  sendSupport: boolean
  receiveSupport: boolean
}

type OmittedTokenAssetFields = 'chain' | 'network' | 'slip44' | 'explorer' | 'explorerTxLink'
type TokenAssetFields = {
  tokenId: string
  contractType: ContractTypes
}
export type TokenAsset = Omit<AbstractAsset, OmittedTokenAssetFields> & TokenAssetFields
export type BaseAsset = AbstractAsset & { tokens?: TokenAsset[] }
export type Asset = AbstractAsset & Partial<TokenAssetFields>

export enum ContractTypes {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  OTHER = 'OTHER',
  NONE = 'NONE'
}

export enum ChainTypes {
  Ethereum = 'ethereum',
  Bitcoin = 'bitcoin'
}

export enum NetworkTypes {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET', // BTC, LTC, etc...
  ETH_ROPSTEN = 'ETH_ROPSTEN',
  ETH_RINKEBY = 'ETH_RINKEBY'
}

// market-service

export type MarketData = {
  price: string
  marketCap: string
  volume: string
  changePercent24Hr: number
}

export enum HistoryTimeframe {
  HOUR = '1H',
  DAY = '24H',
  WEEK = '1W',
  MONTH = '1M',
  YEAR = '1Y',
  ALL = 'All'
}

export type HistoryData = {
  price: number
  date: string
}

export type PriceHistoryArgs = {
  chain: ChainTypes
  timeframe: HistoryTimeframe
  tokenId?: string
}

export type MarketDataArgs = {
  chain: ChainTypes
  tokenId?: string
}

export type MarketDataType = (args: MarketDataArgs) => Promise<MarketData | null>

export type PriceHistoryType = (args: PriceHistoryArgs) => Promise<HistoryData[] | null>

// swapper

export enum SwapperType {
  Zrx = '0x',
  Thorchain = 'Thorchain'
}

export type ETHFeeData = {
  fee?: string
  gas?: string
  estimatedGas?: string
  gasPrice?: string
  approvalFee?: string
  protocolFee?: string
  minimumProtocolFee?: string
  receiveNetworkFee?: string
}

export type SwapSource = {
  name: string
  proportion: string
}

export interface MinMaxOutput {
  minimum: string
  maximum: string
  minimumPrice?: string
}

export type QuoteResponse = {
  price: string
  guaranteedPrice: string
  to: string
  data?: string
  value?: string
  gas?: string
  estimatedGas?: string
  gasPrice?: string
  protocolFee?: string
  minimumProtocolFee?: string
  buyTokenAddress?: string
  sellTokenAddress?: string
  buyAmount?: string
  sellAmount?: string
  allowanceTarget?: string
  sources?: Array<SwapSource>
}

export type ThorVaultInfo = {
  routerContractAddress?: string
  vaultAddress: string
  timestamp: string
}

export type SignTx = ETHSignTx | BTCSignTx

type ChainTxTypeInner = {
  [ChainTypes.Ethereum]: ETHSignTx
  [ChainTypes.Bitcoin]: BTCSignTx
}
export type ChainTxType<T> = T extends keyof ChainTxTypeInner ? ChainTxTypeInner[T] : never

export type BuildThorTradeOutput = SignTxInput<unknown> & ThorVaultInfo

export type Quote = {
  success: boolean
  statusCode?: number
  statusReason?: string
  sellAssetAccountId?: string
  buyAssetAccountId?: string
  sellAsset: Asset
  buyAsset: Asset
  rate?: string
  depositAddress?: string // this is dex contract address for eth swaps
  receiveAddress?: string
  buyAmount?: string
  sellAmount?: string
  minimum?: string | null
  maximum?: string | null
  guaranteedPrice?: string
  slipScore?: string
  txData?: string | BuildThorTradeOutput | SignTxInput<ThorchainSignTx> // unsigned tx if available at quote time
  value?: string
  feeData?: FeeDataEstimate
  allowanceContract?: string
  allowanceGrantRequired?: boolean
  slippage?: string
  priceImpact?: string
  orderId?: string
  sources?: Array<SwapSource>
  timestamp?: number
}

export type GetQuoteInput = {
  sellAsset: Asset
  buyAsset: Asset
  sellAmount?: string
  buyAmount?: string
  sellAssetAccountId?: string
  buyAssetAccountId?: string
  slippage?: string
  priceImpact?: string
  sendMax?: boolean
  minimumPrice?: string
  minimum?: string
}

export type BuildQuoteTxInput = {
  input: GetQuoteInput
  wallet: HDWallet
}

export type ExecQuoteInput = {
  quote: Quote
  wallet: HDWallet
}

export type ExecQuoteOutput = {
  txid: string
}

export type ApprovalNeededInput = {
  quote: Quote
  wallet: HDWallet
}

export type ApprovalNeededOutput = {
  approvalNeeded: boolean
  gas?: string
  gasPrice?: string
}

// chain-adapters

type TransactionBase<T extends ChainTypes> = {
  network: NetworkTypes
  chain: T
  symbol: string
  txid: string
  status: string
  from: string
  to: string
  blockHash: string
  blockHeight: number
  confirmations: number
  timestamp: number
  value: string
  fee: string
}

type EthereumSpecificFields = {
  nonce: string
}

type BitcoinSpecificFields = {
  opReturnData?: string
}

type ChainFieldMap = {
  [ChainTypes.Ethereum]: EthereumSpecificFields
  [ChainTypes.Bitcoin]: BitcoinSpecificFields
}

type ChainSpecificFields<T extends ChainTypes> = T extends keyof ChainFieldMap
  ? ChainFieldMap[T]
  : never

export type Transaction<T extends ChainTypes = ChainTypes> = TransactionBase<T> & {
  // this intersection looks redundant, but is actually required
  // see the types.assert.ts file for the desired behaviour
  details: ChainSpecificFields<T> & Record<string, undefined>
}

export type TxHistoryResponse<T extends ChainTypes> = {
  page: number
  totalPages: number
  txs: number
  transactions: Transaction<T>[]
}

export type Token = {
  type: string
  name: string
  path?: string
  contract?: string
  transfers: number
  symbol?: string
  decimals?: number
  balance?: string
  totalReceived?: string
  totalSent?: string
}

export type Account = EthereumAccount | BitcoinAccount

export type EthereumAccount = {
  network: NetworkTypes
  symbol: string
  address: string
  balance: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  tokens: Token[]
}

export interface BitcoinAccount {
  /**
   *
   * @type {string}
   * @memberof BitcoinAccount
   */
  balance: string
  /**
   *
   * @type {string}
   * @memberof BitcoinAccount
   */
  pubkey: string
  /**
   * List of associated addresses for an xpub
   * @type {Array<Account>}
   * @memberof BitcoinAccount
   */
  addresses?: Array<Account>
  /**
   * The next unused receive address index for an xpub (change index 0)
   * @type {number}
   * @memberof BitcoinAccount
   */
  nextReceiveAddressIndex?: number
  /**
   * The next unused change address index for an xpub (change index 1)
   * @type {number}
   * @memberof BitcoinAccount
   */
  nextChangeAddressIndex?: number
}

export type BroadcastTxResponse = {
  network: NetworkTypes
  txid: string
}

export type BTCRecipient = {
  value: number
  address?: string
}

export type BuildSendTxInput = {
  to: string
  value: string
  wallet: HDWallet
  /*** In base units */
  fee?: string
  /*** Optional param for eth txs indicating what ERC20 is being sent */
  erc20ContractAddress?: string
  recipients?: BTCRecipient[]
  opReturnData?: string
  scriptType?: BTCInputScriptType
  bip32Params: BIP32Params
}

export type SignTxInput<TxType> = {
  txToSign: TxType
  wallet: HDWallet
}

export type BIP32Params = {
  purpose: number
  coinType: number
  accountNumber: number
  isChange?: boolean
  index?: number
}

export type GetBitcoinAddressParams = BIP32Params & {
  wallet: HDWallet
  scriptType?: BTCInputScriptType
}

export type GetAddressInputBase = {
  wallet: HDWallet
  path: string
}

export type GetBitcoinAddressInput = GetAddressInputBase & {
  bip32Params: BIP32Params
  scriptType: BTCInputScriptType.SpendWitness
}

export type GetEthereumAddressInput = GetAddressInputBase

export type GetAddressInput = GetBitcoinAddressInput | GetEthereumAddressInput

export type GetFeeDataInput = {
  contractAddress?: string
  from: string
  to: string
  value: string
}

export type BTCFeeDataType = {
  minMinutes: number
  maxMinutes: number
  effort: number
  fee?: number
}

export enum BTCFeeDataKey {
  Fastest = 'fastest',
  HalfHour = 'halfHour',
  OneHour = '1hour',
  SixHour = '6hour',
  TwentyFourHour = '24hour'
}

export type SignBitcoinTxInput = {
  txToSign: BTCSignTx
  wallet: HDWallet
}

export type BTCFeeDataEstimate = {
  [BTCFeeDataKey.Fastest]: BTCFeeDataType
  [BTCFeeDataKey.HalfHour]: BTCFeeDataType
  [BTCFeeDataKey.OneHour]: BTCFeeDataType
  [BTCFeeDataKey.SixHour]: BTCFeeDataType
  [BTCFeeDataKey.TwentyFourHour]: BTCFeeDataType
}

export type FeeDataEstimate = ETHFeeDataEstimate | BTCFeeDataEstimate

export enum ETHFeeDataKey {
  Slow = 'slow',
  Average = 'average',
  Fast = 'fast'
}

export type ETHFeeDataType = {
  feeUnitPrice: string
  networkFee: string
  feeUnits: string
}

export type ETHFeeDataEstimate = {
  [ETHFeeDataKey.Slow]: ETHFeeDataType
  [ETHFeeDataKey.Average]: ETHFeeDataType
  [ETHFeeDataKey.Fast]: ETHFeeDataType
}

export enum ValidAddressResultType {
  Valid = 'valid',
  Invalid = 'invalid'
}

export type ValidAddressResult = {
  /**
   * Is this Address valid
   */
  valid: boolean
  /**
   * Result type of valid address
   */
  result: ValidAddressResultType
}

export type FeeEstimateInput = {
  to: string
  from: string
  data: string
  value: string
}