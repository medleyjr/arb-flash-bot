module.exports = {

    rpcUrl: 'https://api.harmony.one/',
    walletPrivateKey: '',
    arbContractAddress: '',
    loanTokenAddress: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
    uniswapArbContractAddress: '',

    dexList: [
        {
            name: "DefiKingdoms",
            swapRouterAddress: "0x24ad62502d1C652Cc7684081169D04896aC20f30",
            swapFactoryAddress: "0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7",
            coins: [
                { code: '1ETH', address: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013' },
                { code: '1WBTC', address: '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9' },
                { code: 'FOX', address: '0x0159ED2E06DDCD46a25E74eb8e159Ce666B28687' }
            ]
        },
        {
            name: "Sushiswap",
            swapRouterAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
            swapFactoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
            coins: [
                { code: '1ETH', address: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013' },
                { code: '1WBTC', address: '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9' },
                { code: '1SUSHI', address: '0xBEC775Cb42AbFa4288dE81F387a9b1A3c4Bc552A' },
                { code: 'FOX', address: '0x0159ED2E06DDCD46a25E74eb8e159Ce666B28687' }
            ]
        },
        {
            name: "Viperswap",
            swapRouterAddress: "0xf012702a5f0e54015362cBCA26a26fc90AA832a3",
            swapFactoryAddress: "0x7D02c116b98d0965ba7B642ace0183ad8b8D2196",
            coins: [
                { code: '1ETH', address: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013' },
                { code: '1WBTC', address: '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9' },
                { code: '1SUSHI', address: '0xBEC775Cb42AbFa4288dE81F387a9b1A3c4Bc552A' }
            ]
        }
    ]
}