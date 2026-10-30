
import { expect } from "chai";
import { network } from "hardhat";

describe("CertificateVerificationV2", function () {
  async function deployContract() {
    const { ethers } = await network.connect();

    const [
      admin,
      institution,
      unauthorized,
      anotherInstitution,
    ] = await ethers.getSigners();

    const contract = await ethers.deployContract(
      "CertificateVerificationV2"
    );

    await contract.waitForDeployment();

    return {
      ethers,
      contract,
      admin,
      institution,
      unauthorized,
      anotherInstitution,
    };
  }

  it("sets the deployer as administrator", async function () {
    const { contract, admin } = await deployContract();

    expect(await contract.owner()).to.equal(admin.address);
  });

  it("allows administrator to authorize an institution", async function () {
    const { contract, institution } = await deployContract();

    await contract.authorizeInstitution(institution.address);

    expect(
      await contract.authorizedInstitutions(institution.address)
    ).to.equal(true);
  });

  it("prevents unauthorized users from authorizing institutions", async function () {
    const { contract, institution, unauthorized } =
      await deployContract();

    await expect(
      contract
        .connect(unauthorized)
        .authorizeInstitution(institution.address)
    ).to.be.revertedWith("Only administrator");
  });

  it("allows an authorized institution to register a certificate", async function () {
    const { ethers, contract, institution } = await deployContract();

    const documentHash = ethers.id("sample-certificate");

    await contract.authorizeInstitution(institution.address);

    await contract
      .connect(institution)
      .registerCertificate(documentHash);

    const result = await contract.verifyCertificate(documentHash);

    expect(result.exists).to.equal(true);
    expect(result.revoked).to.equal(false);
    expect(result.issuer).to.equal(institution.address);
  });

  it("prevents unauthorized users from registering certificates", async function () {
    const { ethers, contract, unauthorized } =
      await deployContract();

    const documentHash = ethers.id("unauthorized-certificate");

    await expect(
      contract
        .connect(unauthorized)
        .registerCertificate(documentHash)
    ).to.be.revertedWith("Not an authorized issuer");
  });

  it("allows the original issuer to revoke a certificate", async function () {
    const { ethers, contract, institution } = await deployContract();

    const documentHash = ethers.id("certificate-to-revoke");

    await contract.authorizeInstitution(institution.address);

    await contract
      .connect(institution)
      .registerCertificate(documentHash);

    await contract
      .connect(institution)
      .revokeCertificate(documentHash);

    const result = await contract.verifyCertificate(documentHash);

    expect(result.exists).to.equal(true);
    expect(result.revoked).to.equal(true);
  });

  it("prevents another institution from revoking a certificate", async function () {
    const {
      ethers,
      contract,
      institution,
      anotherInstitution,
    } = await deployContract();

    const documentHash = ethers.id("protected-certificate");

    await contract.authorizeInstitution(institution.address);
    await contract.authorizeInstitution(anotherInstitution.address);

    await contract
      .connect(institution)
      .registerCertificate(documentHash);

    await expect(
      contract
        .connect(anotherInstitution)
        .revokeCertificate(documentHash)
    ).to.be.revertedWith("Not authorized to revoke");
  });

  it("prevents duplicate certificate registration", async function () {
    const { ethers, contract, institution } = await deployContract();

    const documentHash = ethers.id("duplicate-certificate");

    await contract.authorizeInstitution(institution.address);

    await contract
      .connect(institution)
      .registerCertificate(documentHash);

    await expect(
      contract
        .connect(institution)
        .registerCertificate(documentHash)
    ).to.be.revertedWith("Already registered");
  });
});
