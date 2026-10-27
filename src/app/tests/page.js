import TestLibrary from "./test-library";
import AccessGate from "../access-gate";
export default function Page() { return <AccessGate password="physics@180" storageKey="edunote-tests-access" promptMessage="Enter the test access password:"><TestLibrary /></AccessGate>; }
