import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "Twixxer - Connect with the world" },
    { name: "description", content: "Join Twixxer today and connect with friends, share your thoughts, and stay updated with what's happening in the world." },
  ];
}

export default function Home() {
  return (
    <Welcome message="Connect with the world on Twixxer" />
  );
}
