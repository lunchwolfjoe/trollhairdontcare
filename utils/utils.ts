export const encodedRedirect = (
  type: string,
  path: string,
  message: string
) => {
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  searchParams.set("message", message);
  
  return {
    redirect: true,
    destination: `${path}?${searchParams.toString()}`,
  };
}; 