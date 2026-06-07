import MaPetiteComptaClient from "@/app/MaPetiteComptaClient";

export default async function NewTransactionPage({
  searchParams
}: {
  searchParams?: Promise<{ edit?: string | string[] }>;
}) {
  const params = await searchParams;
  const editTransactionId = typeof params?.edit === "string" ? params.edit : null;

  return <MaPetiteComptaClient activePage="add" editTransactionId={editTransactionId} />;
}
