
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateVerificationV2 {
    address public owner;

    struct Certificate {
        address issuer;
        uint256 registeredAt;
        bool exists;
        bool revoked;
    }

    mapping(address => bool) public authorizedInstitutions;
    mapping(bytes32 => Certificate) private certificates;

    event InstitutionAuthorized(address indexed institution);
    event InstitutionRemoved(address indexed institution);

    event CertificateRegistered(
        bytes32 indexed documentHash,
        address indexed issuer,
        uint256 registeredAt
    );

    event CertificateRevoked(
        bytes32 indexed documentHash,
        address indexed revokedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only administrator");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            msg.sender == owner || authorizedInstitutions[msg.sender],
            "Not an authorized issuer"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeInstitution(address institution) external onlyOwner {
        require(institution != address(0), "Invalid institution address");
        require(!authorizedInstitutions[institution], "Already authorized");

        authorizedInstitutions[institution] = true;

        emit InstitutionAuthorized(institution);
    }

    function removeInstitution(address institution) external onlyOwner {
        require(authorizedInstitutions[institution], "Not authorized");

        authorizedInstitutions[institution] = false;

        emit InstitutionRemoved(institution);
    }

    function registerCertificate(bytes32 documentHash)
        external
        onlyAuthorizedIssuer
    {
        require(documentHash != bytes32(0), "Invalid document hash");
        require(!certificates[documentHash].exists, "Already registered");

        certificates[documentHash] = Certificate({
            issuer: msg.sender,
            registeredAt: block.timestamp,
            exists: true,
            revoked: false
        });

        emit CertificateRegistered(
            documentHash,
            msg.sender,
            block.timestamp
        );
    }

    function revokeCertificate(bytes32 documentHash)
        external
    {
        Certificate storage certificate = certificates[documentHash];

        require(certificate.exists, "Certificate not found");
        require(!certificate.revoked, "Already revoked");

        require(
            msg.sender == owner || msg.sender == certificate.issuer,
            "Not authorized to revoke"
        );

        certificate.revoked = true;

        emit CertificateRevoked(documentHash, msg.sender);
    }

    function verifyCertificate(bytes32 documentHash)
        external
        view
        returns (
            bool exists,
            bool revoked,
            address issuer,
            uint256 registeredAt
        )
    {
        Certificate memory certificate = certificates[documentHash];

        return (
            certificate.exists,
            certificate.revoked,
            certificate.issuer,
            certificate.registeredAt
        );
    }
}
