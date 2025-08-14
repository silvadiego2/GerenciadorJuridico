# Guia de Desenvolvimento - Sistema Jurídico

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### Instalação
```bash
npm install
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Auth/           # Componentes de autenticação
│   ├── Dashboard/      # Componentes do dashboard
│   ├── Layout/         # Layout e navegação
│   └── Users/          # Componentes de usuários
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── lib/                # Bibliotecas e serviços
│   └── integrations/   # Integrações externas
├── pages/              # Páginas da aplicação
├── types/              # Definições TypeScript
└── utils/              # Utilitários e helpers
```

## 🔧 Hooks Customizados

### useAuth
Gerencia autenticação e estado do usuário
```typescript
const { user, login, logout, isAuthenticated } = useAuth();
```

### usePermissions
Controla permissões por perfil
```typescript
const { hasPermission, canAccess, isAdmin } = usePermissions();
```

### useNotifications
Sistema de notificações
```typescript
const { success, error, warning, info } = useNotifications();
```

### useLocalStorage
Persistência local de dados
```typescript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

### useDebounce
Debounce para inputs de busca
```typescript
const debouncedValue = useDebounce(searchTerm, 300);
```

## 🎨 Padrões de Design

### Cores Principais
- **Azul Jurídico**: `#1E40AF` (blue-700)
- **Dourado**: `#F59E0B` (amber-500)
- **Cinza Neutro**: `#6B7280` (gray-500)
- **Verde Sucesso**: `#10B981` (emerald-500)
- **Vermelho Erro**: `#EF4444` (red-500)

### Componentes Base
- Cards com `bg-white rounded-lg shadow-sm border`
- Botões com estados hover e disabled
- Inputs com focus ring azul
- Modais centralizados com backdrop

## 🔐 Sistema de Permissões

### Perfis de Usuário
- **Admin**: Acesso total
- **Advogado**: Gestão completa exceto usuários
- **Estagiário**: Acesso limitado, sem financeiro
- **Cliente**: Apenas visualização própria

### Verificação de Permissões
```typescript
// Verificar permissão específica
if (hasPermission('write_clients')) {
  // Permitir edição
}

// Verificar acesso a recurso
if (canAccess('financial', 'read')) {
  // Mostrar dados financeiros
}
```

## 📡 Integrações

### DataJud CNJ
```typescript
import { dataJudService } from '@/lib/integrations/datajud-service';

const result = await dataJudService.searchProcess({
  numeroProcesso: '1234567-89.2024.8.05.0001',
  tribunal: 'tjba',
  apiKey: 'sua-api-key'
});
```

### TJ-BA Transparência
```typescript
import { tjbaTransparencyService } from '@/lib/integrations/tjba-transparency';

const indicators = await tjbaTransparencyService.getIndicadores();
const metas = await tjbaTransparencyService.getMetas();
```

### PJe SOAP
```typescript
import { pjeSOAPService } from '@/lib/integrations/pje-soap';

pjeSOAPService.addConfig('tjba-1g', {
  wsdlUrl: 'https://pje.tjba.jus.br/pje/intercomunicacao?wsdl',
  usuario: 'usuario',
  senha: 'senha',
  tribunal: 'tjba',
  grau: '1'
});
```

## 🛠️ Utilitários

### Formatadores
```typescript
import { formatCurrency, formatCPF, formatProcessNumber } from '@/utils';

const price = formatCurrency(1500); // R$ 1.500,00
const cpf = formatCPF('12345678900'); // 123.456.789-00
const process = formatProcessNumber('12345678920248050001'); // 1234567-89.2024.8.05.0001
```

### Validadores
```typescript
import { isValidCPF, isValidCNPJ, isValidEmail } from '@/utils';

const validCPF = isValidCPF('123.456.789-00');
const validEmail = isValidEmail('user@example.com');
```

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`UserModal`)
- **Hooks**: camelCase com prefixo `use` (`useAuth`)
- **Utilitários**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### Estrutura de Componentes
```typescript
interface ComponentProps {
  // Props tipadas
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks no topo
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {
    // Lógica
  };
  
  // Render
  return (
    <div className="component-styles">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

## 🧪 Testes (Futuro)

### Estrutura de Testes
```
src/
├── __tests__/          # Testes unitários
├── components/
│   └── __tests__/      # Testes de componentes
└── utils/
    └── __tests__/      # Testes de utilitários
```

### Comandos de Teste
```bash
npm run test          # Executar testes
npm run test:watch    # Modo watch
npm run test:coverage # Cobertura
```

## 🚀 Deploy

### Build de Produção
```bash
npm run build
npm run preview
```

### Variáveis de Ambiente
```env
VITE_API_URL=https://api.exemplo.com
VITE_DATAJUD_API_KEY=sua-chave-datajud
```

## 📊 Monitoramento

### Logs de Desenvolvimento
- Console.log apenas em desenvolvimento
- Usar console.error para erros críticos
- Implementar sistema de logs estruturado

### Performance
- Lazy loading de componentes pesados
- Memoização com React.memo
- Debounce em buscas
- Paginação em listas grandes

## 🔄 Fluxo de Desenvolvimento

### Git Flow
1. Feature branches: `feature/nome-da-feature`
2. Commits semânticos: `feat:`, `fix:`, `docs:`
3. Pull requests com revisão
4. Deploy automático na main

### Processo de Desenvolvimento
1. Analisar requisito
2. Criar branch feature
3. Implementar com testes
4. Revisar código
5. Merge e deploy

## 📚 Recursos Úteis

### Documentação
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)

### APIs Externas
- [DataJud CNJ](https://datajud-wiki.cnj.jus.br/)
- [TJ-BA](https://www.tjba.jus.br/)
- [PJe](https://www.pje.jus.br/)