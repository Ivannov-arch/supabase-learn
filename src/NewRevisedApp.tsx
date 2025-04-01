import Todos from "./sections/Todos";

export default function NewRevisedApp() {
  return (
    <>
      <div className="px-15 pt-3 pb-12">
        <h1 className="mb-2">ToDo List</h1>
        <Todos />
      </div>
    </>
  );
}
