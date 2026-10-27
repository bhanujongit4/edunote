import TestCreator from "./test-creator";
import AccessGate from "../../access-gate";
export default function Page() { return <AccessGate password="bhanujgoat" storageKey="edunote-create-access" promptMessage="Enter the test creation password:"><TestCreator /></AccessGate>; }
