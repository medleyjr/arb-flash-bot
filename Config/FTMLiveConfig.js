module.exports = {

    rpcUrl: 'https://rpc.ftm.tools',
    rpcUrl2: 'https://rpcapi.fantom.network',
    walletPrivateKey: '<Wallet private key>',
    arbContractAddress: '',
    loanTokenAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    uniswapArbContractAddress: '',
    gasProfitRatio: 4000000000000,
    minAccountValue: 4,


    dexList1: [
        {
            name: "SpookySwap",
            feePerc: 0.2,
            swapRouterAddress: "0xf491e7b69e4244ad4002bc14e878a34207e38c29",
            swapFactoryAddress: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
            coins: [
                { code: 'ATLAS', address: "0x92df3eaBf7c1c2A6b3D5793f6d53778eA78c48b2" },
                { code: 'DEUS', address: "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44" },
                { code: 'BIFI', address: "0xd6070ae98b8069de6B494332d1A1a81B6179D960" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" }

            ]
        },
        {
            name: "Spiritswap",
            feePerc: 0.3,
            swapRouterAddress: "0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52",
            swapFactoryAddress: "0xef45d134b73241eda7703fa787148d9c9f4950b0",
            coins: [
                { code: 'ATLAS', address: "0x92df3eaBf7c1c2A6b3D5793f6d53778eA78c48b2" },
                { code: 'DEUS', address: "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44" },
                { code: 'BIFI', address: "0xd6070ae98b8069de6B494332d1A1a81B6179D960" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" }
            ]
        }
    ],
    dexList: [
        {
            name: "SpookySwap",
            swapRouterAddress: "0xf491e7b69e4244ad4002bc14e878a34207e38c29",
            swapFactoryAddress: "0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3",
            feePerc: 0.2,
            coins: [
                { code: 'ATLAS', address: "0x92df3eaBf7c1c2A6b3D5793f6d53778eA78c48b2" },
                { code: 'DEUS', address: "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44" },
                { code: 'BIFI', address: "0xd6070ae98b8069de6B494332d1A1a81B6179D960" },
                { code: 'BTC', address: "0x321162Cd933E2Be498Cd2267a90534A804051b11" },
                { code: 'LQDR', address: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
                { code: 'OATH', address: "0x21Ada0D2aC28C3A5Fa3cD2eE30882dA8812279B6" },
                { code: 'TAROT', address: "0xC5e2B037D30a390e62180970B3aa4E91868764cD" },
                { code: 'LINK', address: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8" },
                { code: 'MULTI', address: "0x9Fb9a33956351cf4fa040f65A13b835A3C8764E3" },
                { code: 'IB', address: "0x00a35FD824c717879BF370E70AC6868b95870Dfb" },
                { code: 'SUSHI', address: "0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC" },
                { code: 'TSHARE', address: "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37" },
                { code: 'USDC', address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" },
                { code: 'ETH', address: "0x74b23882a30290451A17c44f4F05243b6b58C76d" },
                { code: 'SOLID', address: "0x888EF71766ca594DED1F0FA3AE64eD2941740A20" },
                { code: 'SPELL', address: "0x468003B688943977e6130F4F68F23aad939a1040" }
            ]
        },
        {
            name: "Spiritswap",
            feePerc: 0.3,
            swapRouterAddress: "0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52",
            swapFactoryAddress: "0xef45d134b73241eda7703fa787148d9c9f4950b0",
            coins: [
                { code: 'ATLAS', address: "0x92df3eaBf7c1c2A6b3D5793f6d53778eA78c48b2" },
                { code: 'DEUS', address: "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44" },
                { code: 'BIFI', address: "0xd6070ae98b8069de6B494332d1A1a81B6179D960" },
                { code: 'BTC', address: "0x321162Cd933E2Be498Cd2267a90534A804051b11" },
                { code: 'LQDR', address: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
                { code: 'OATH', address: "0x21Ada0D2aC28C3A5Fa3cD2eE30882dA8812279B6" },
                { code: 'TAROT', address: "0xC5e2B037D30a390e62180970B3aa4E91868764cD" },
                { code: 'LINK', address: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8" },
                { code: 'MULTI', address: "0x9Fb9a33956351cf4fa040f65A13b835A3C8764E3" },
                { code: 'USDC', address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" },
                { code: 'ETH', address: "0x74b23882a30290451A17c44f4F05243b6b58C76d" },
                { code: 'SPELL', address: "0x468003B688943977e6130F4F68F23aad939a1040" }
            ]
        },
        {
            name: "Sushiswap",
            feePerc: 0.3,
            swapRouterAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
            swapFactoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
            coins: [
                { code: 'LQDR', address: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
                { code: 'ICE', address: "0xf16e81dce15B08F326220742020379B855B87DF9" },
                { code: 'LINK', address: "0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8" },
                { code: 'SUSHI', address: "0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC" },
                { code: 'USDC', address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" },
                { code: 'ETH', address: "0x74b23882a30290451A17c44f4F05243b6b58C76d" }
            ]
        },
        {
            name: "Protofi",
            feePerc: 0.3,
            swapRouterAddress: "0xF4C587a0972Ac2039BFF67Bc44574bB403eF5235",
            swapFactoryAddress: "0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76",
            coins: [
                { code: 'LQDR', address: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
                { code: 'BTC', address: "0x321162Cd933E2Be498Cd2267a90534A804051b11" },
                { code: 'TSHARE', address: "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37" },
                { code: 'USDC', address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" },
                { code: 'DAI', address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E" },
                { code: 'ETH', address: "0x74b23882a30290451A17c44f4F05243b6b58C76d" },
                { code: 'SOLID', address: "0x888EF71766ca594DED1F0FA3AE64eD2941740A20" },
                { code: 'SPELL', address: "0x468003B688943977e6130F4F68F23aad939a1040" }
            ]
        }
    ],
    del: {
        name: "Solidly",
        swapRouterAddress: "0xa38cd27185a464914D3046f0AB9d43356B34829D",
        swapFactoryAddress: "0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28",
        coins: [
            { code: 'LQDR', address: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
            { code: 'OATH', address: "0x21Ada0D2aC28C3A5Fa3cD2eE30882dA8812279B6" },
            { code: 'TAROT', address: "0xC5e2B037D30a390e62180970B3aa4E91868764cD" },
            { code: 'MULTI', address: "0x9Fb9a33956351cf4fa040f65A13b835A3C8764E3" },
            { code: 'IB', address: "0x00a35FD824c717879BF370E70AC6868b95870Dfb" }
        ]
    }
}