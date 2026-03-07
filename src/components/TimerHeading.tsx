"use client";

import { Heading } from "@chakra-ui/react";

interface TimerHeadingProps {
  isBreak: boolean;
}

const TimerHeading: React.FC<TimerHeadingProps> = ({ isBreak }) => (
  <Heading
    as="h1"
    mb={4}
    textAlign="center"
    fontSize={{ base: "2xl", md: "4xl" }}
  >
    {isBreak ? "Break Time" : "Pomodoro Timer"}
  </Heading>
);

export default TimerHeading;
