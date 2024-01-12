import inquirer from 'inquirer';

export async function askForName() {
  type answersT = { name: string };

  // ❔ Ask for user input.
  const { name } = await inquirer.prompt<answersT>([
    {
      type: 'input',
      name: 'name',
      default: 'John Doe',
      message: 'Enter your name :',
    },
  ]);

  return name;
}

export async function askForAge() {
  type answersT = { age: number };

  // ❔ Ask for user input.
  const { age } = await inquirer.prompt<answersT>([
    {
      type: 'input',
      name: 'age',
      message: 'Enter your age :',
    },
  ]);

  return age;
}
