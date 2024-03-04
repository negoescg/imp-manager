// import { auth } from '@clerk/nextjs';
// import Clerk from '@clerk/clerk-sdk-node';

export default async function Home() {
  // const { userId } = auth();
  // const orgList = await Clerk.users.getOrganizationMembershipList({
  //   userId: userId ?? '',
  // });

  // const orgRole = orgList[0].role;
  return <div>Instruction maybe depending on user role ?</div>;
}
