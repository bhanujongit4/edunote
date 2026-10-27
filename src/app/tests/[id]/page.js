import TestAttempt from "./test-attempt";
import AccessGate from "../../access-gate";
export default async function Page({ params }) { const { id } = await params; return <AccessGate scope="tests" promptMessage="Enter the test access password:"><TestAttempt id={id} /></AccessGate>; }
