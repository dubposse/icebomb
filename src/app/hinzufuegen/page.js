import AddIceForm from "@/components/AddIceForm";

export const metadata = { title: "Eis hinzufügen – icebomb" };

export default function AddPage() {
  return (
    <section className="narrow">
      <h1 className="page-title">Eis hinzufügen</h1>
      <AddIceForm />
    </section>
  );
}
