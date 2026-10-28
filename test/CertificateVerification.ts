
import { describe, it } from "mocha";
import { strict as assert } from "node:assert";
import { network } from "hardhat";

describe("CertificateVerification", function () {
  it("should register and verify a certificate", async function () {
    const { ethers } = await network.connect();
    const contract = await ethers.deployContract("CertificateVerification");

    const certificateHash =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    await contract.registerCertificate(certificateHash);

    assert.equal(
      await contract.verifyCertificate(certificateHash),
      true
    );
  });
});
