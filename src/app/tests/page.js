import TestLibrary from "./test-library";
import AccessGate from "../access-gate";
export default function Page() { return <AccessGate scope="tests" promptMessage="Enter the test access password:"><TestLibrary /></AccessGate>; }
