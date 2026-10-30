
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificateVerificationV2Module", (m) => {
  const certificateVerificationV2 = m.contract(
    "CertificateVerificationV2"
  );

  return { certificateVerificationV2 };
});
