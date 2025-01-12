import Error from "@/components/error";
import Wrapper from "@/layouts/Wrapper";


export const metadata = {
  title: "Mirror Exhibit 404 || error - Mirror Exhibit",
};



const index = () => {
  return (
    <Wrapper>
      <Error />
    </Wrapper>
  );
};

export default index;