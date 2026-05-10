import { address, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import { findAssociatedTokenPda, getCreateAssociatedTokenIdempotentInstructionAsync, getCreateAssociatedTokenIdempotentInstructionDataCodec, getCreateAssociatedTokenInstructionAsync, getMintToInstruction, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");
const token_decimals = 1_000_000n;


const mint = address("9LZZv6KRqpc1Xc3YepELKmjxpxWkYDZd8R9qDmrjebp7");

(async () => {

    try {
        const signer = await createKeyPairSignerFromBytes(
            new Uint8Array(wallet)
        );

        const [ata] = await findAssociatedTokenPda({
            mint,
            owner: signer.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS
        })
        console.log(`Your ata is : ${ata}`)

        const createAtaIx = await getCreateAssociatedTokenIdempotentInstructionAsync({
            payer: signer,
            mint,
            owner: signer.address
        });

        const mintToIx = getMintToInstruction({
            mint,
            token: ata,
            mintAuthority: signer,
            amount: 10n * token_decimals
        });

        const {value: latestBlockhash} = await rpc.getLatestBlockhash().send();
        const msg = createTransactionMessage({ version: 0});

        const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);
        const msgWithLiftime = setTransactionMessageLifetimeUsingBlockhash(
                latestBlockhash,
                msgWithPayer
            )

        const txMessage = appendTransactionMessageInstructions(
            [createAtaIx, mintToIx],
            msgWithLiftime
        )

        const signedTx = await signTransactionMessageWithSigners(txMessage);
        assertIsTransactionWithBlockhashLifetime(signedTx);
        const signature = getSignatureFromTransaction(signedTx);
        const sendAndConfirm = sendAndConfirmTransactionFactory({
                rpc, rpcSubscriptions
            });
            
        await sendAndConfirm(signedTx, {commitment: "confirmed"});

        console.log(`mint txid: ${signature}`);
    
    }
    
    catch (error){
        console.log(error);
    }
        
})()

//Your ata is : 6Bfdmcr5vLnL4See4S2eUhvnEH4AfNTKNU8dDNXLAaCM
//mint txid: 5Vbb3ZkZB9tz3FZEpLCjQ6KmiiZAgrsgxwYuhodRPjHSiF1RT8q5KTy3ajh8kC2MZHwj8qzoyE6WarTBzEeaaDKn