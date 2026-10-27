import TestCreator from "./test-creator";
import AccessGate from "../../access-gate";
export default function Page() { return <AccessGate scope="create" promptMessage="Enter the test creation password:"><TestCreator /></AccessGate>; }
