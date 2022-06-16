import {
  AssistantPackage,
  RuleDefinition,
} from '@sketch-hq/sketch-assistant-types'

const duplicateSymbols: RuleDefinition = {
  rule: async (context) => {
    interface Duplicate {
      name: string
      number: number
      local: boolean
      foreign: boolean
      symbol: any
    }

    var duplicates: Array<Duplicate> = [];

    for (const symbol of context.utils.objects.symbolMaster) {
      var existingElement = duplicates.find((element) => element.name == symbol.name);
      if (existingElement != null)
        existingElement.number++;
      else
        duplicates.push({ name: symbol.name, number: 1, local: true, foreign: false, symbol });
    }

    for (const msimmutablesymbol of context.utils.foreignObjects.MSImmutableForeignSymbol) {
      var symbol = msimmutablesymbol.symbolMaster;
      var existingElement = duplicates.find((element) => element.name == symbol.name)
      if (existingElement != null) {
        existingElement.number++;
        existingElement.foreign = true;
      }
      else {
        duplicates.push({ name: symbol.name, number: 1, local: false, foreign: true, symbol })
      }
    }

    for (const duplicate of (duplicates.filter((element) => element.number > 1))) {
      context.utils.report(`Symbol ${duplicate.name} duplicate ${duplicate.number} times`);
      context.utils.report("", duplicate.symbol);
    }
  },
  name: 'duplicate-symbols-finder/duplicate-symbols',
  title: 'Duplicate symbols',
  description: 'Reports duplicate symbols in your design file.',
}

const assistant: AssistantPackage = async () => {
  return {
    name: 'symbols-no-duplicated',
    rules: [duplicateSymbols],
    title: (`Symbols should not be duplicated`),
    description: (`Duplicated symbols could cause inconsistencies and make updating components hard to manage.`
    ),
    config: {
      rules: {
        'duplicate-symbols-finder/duplicate-symbols': { active: true },
      },
    },
  }
}

export default assistant