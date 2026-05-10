import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import wallet from "../../devnet-wallet.json";

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

    const image = await readFile("./image.jpg");
    const file = createGenericFile(image, "image.jpg", {
        contentType: "image/jpg",
    });

    const [myUri] = await umi.uploader.upload([file]);
    console.log("Your image URI: ", myUri);
}
catch(error) {
    console.log(error);
}
})()

// Your image URI:  https://gateway.irys.xyz/GZ9Qgb6k2ryMdKEMbHK8Y7pyEG3zyXv2XYc3YGpnZEem
