import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import { createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);


umi.use(
    irysUploader({
        address:"https://devnet.irys.xyz/",
    })
);

umi.use(signerIdentity(signer));

(async () => {
    try {
        const image = "https://gateway.irys.xyz/GZ9Qgb6k2ryMdKEMbHK8Y7pyEG3zyXv2XYc3YGpnZEem"

        const metadata = {
            name: "Armaan",
            description: "ARM",
            image,
            attributes: [{ trait_type: "Rarity", value: "Legendary" }],
            
            properties: {
                files: [
                    {
                        type: "image/jpg",
                        uri: image,
                    },
                ],
                category: "image",
            },
        };

        const myUri = await umi.uploader.uploadJson(metadata);
        console.log(`metadata uri: ${myUri}`);


    } catch (error) {
        console.log(error)
    }
})()

// metadata uri: https://gateway.irys.xyz/6RTsMmt6HCnwx1BD9pWk9jxz11pHnxCyXMqStdE9fzXA