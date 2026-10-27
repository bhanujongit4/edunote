import AttemptReview from "./review";

export default async function Page({ params }) {
  const { attemptId } = await params;
  return <AttemptReview attemptId={attemptId} />;
}
