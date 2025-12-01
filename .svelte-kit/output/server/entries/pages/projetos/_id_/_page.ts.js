const load = ({ params }) => {
  const rawId = params.id;
  const idNum = Number(rawId);
  return {
    // se for um número válido > 0, passa, senão manda null
    projectId: Number.isFinite(idNum) && idNum > 0 ? idNum : null,
  };
};
export { load };
