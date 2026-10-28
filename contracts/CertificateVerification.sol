
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateVerification {
    address public owner;

    mapping(bytes32 => bool) public verifiedCertificates;

    event CertificateRegistered(bytes32 indexed certificateHash);

    constructor() {
        owner = msg.sender;
    }

    function registerCertificate(bytes32 certificateHash) external {
        require(msg.sender == owner, "Only owner can register");
        require(!verifiedCertificates[certificateHash], "Already registered");

        verifiedCertificates[certificateHash] = true;

        emit CertificateRegistered(certificateHash);
    }

    function verifyCertificate(bytes32 certificateHash)
        external
        view
        returns (bool)
    {
        return verifiedCertificates[certificateHash];
    }
}
