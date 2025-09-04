# 🎨 Tela de Login Sapere - Documentação

## 📱 **Design Responsivo e Acolhedor**

A nova tela de login foi criada com foco na experiência do usuário, especialmente pensada para famílias e terapeutas que utilizam o sistema da clínica Sapere.

### 🏷️ **Logo Oficial**
- **Imagem**: Logo oficial da Sapere com corações laranja/amarelo
- **Responsividade**: 
  - Mobile: 128px x 128px
  - Tablet: 176px x 176px  
  - Desktop: 208px x 208px
- **Efeitos**: Drop-shadow suave e animação float sutil

### 🎨 **Paleta de Cores Implementada**
- **Fundo**: Gradiente suave com tons Sapere
  - Laranja (#F97316) - 10% de opacidade
  - Amarelo (#FCD34D) - 5% de opacidade
  - Cinza (#F3F4F6) - 30% de opacidade
- **Botão Principal**: Gradiente laranja (#F97316 → #FB923C)
- **Links**: Marrom Sapere (#92400E)
- **Texto Principal**: Marrom Sapere (#92400E)

### 🔧 **Funcionalidades Implementadas**

#### ✨ **Visual e UX**
- **Card translúcido** com backdrop blur
- **Animações suaves** em todos os elementos
- **Estados de hover** com elevação e glow
- **Feedback visual** para validações
- **Loading states** com spinner personalizado

#### 📱 **Responsividade**
- **Mobile-first approach**
- **Breakpoints otimizados**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Touch targets** otimizados (mín. 44px)
- **Prevenção de zoom** no iOS em campos de input

#### 🛡️ **Validação e Segurança**
- **Validação em tempo real** com mensagens amigáveis
- **Estados de erro** visuais
- **Remember Me** com persistência inteligente
- **Mensagens contextuais** baseadas em URL params

### 🎯 **Estados da Interface**

#### 🔄 **Loading State**
```typescript
// Botão com spinner e texto dinâmico
{isLoading ? (
  <Loader2 className="animate-spin h-5 w-5" />
  <span>Entrando...</span>
) : (
  <span>Entrar no Sistema</span>
)}
```

#### ❌ **Error State**
```typescript
// Mensagem de erro com ícone e animação
<div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-3 animate-pulse">
  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
  <span>{getErrorMessage(error)}</span>
</div>
```

#### ✅ **Success State**
```typescript
// Mensagem de sucesso estilizada
<div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-3">
  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
  <span>{successMessage}</span>
</div>
```

### 🎨 **Classes CSS Customizadas**

#### 🌈 **Gradientes e Backgrounds**
```css
.login-gradient {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(252, 211, 77, 0.05) 50%, rgba(243, 244, 246, 0.3) 100%);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

#### 🔤 **Campos de Input**
```css
.login-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.login-input:focus {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(249, 115, 22, 0.15);
}
```

#### 🚀 **Botão Principal**
```css
.login-button {
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #EA580C 0%, #F97316 100%);
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(249, 115, 22, 0.4);
}
```

### 🔧 **Otimizações Mobile**

#### 📲 **Prevenção de Zoom iOS**
```typescript
// Adiciona maximum-scale=1.0 ao viewport meta tag
const addMaximumScaleToMetaViewport = () => {
  const el = document.querySelector('meta[name=viewport]');
  if (el) {
    let content = el.getAttribute('content');
    content = [content, 'maximum-scale=1.0'].join(', ');
    el.setAttribute('content', content);
  }
};
```

#### 👆 **Touch Targets**
```css
@media (hover: none) and (pointer: coarse) {
  button, input, select, textarea {
    min-height: 44px;
  }
}
```

### 🧪 **Contas de Teste (Desenvolvimento)**

O sistema exibe automaticamente as contas de teste quando em modo de desenvolvimento:

```typescript
{import.meta.env.DEV && (
  <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
    <h3 className="text-sm font-bold text-blue-900 mb-3 text-center">
      🧪 Contas de Teste
    </h3>
    // Cards com as credenciais de teste organizadas por role
  </div>
)}
```

### 📞 **Informações de Contato**

As informações de contato da Sapere são exibidas de forma responsiva:
- **WhatsApp**: (92) 99230-5850
- **Email**: Sapere.recepcao@gmail.com

### 🎭 **Animações Implementadas**

#### 🌊 **Float Animation (Logo)**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

#### ✨ **Pulse Glow (Card)**
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
  50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.5); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

## 🚀 **Como Usar**

1. **Logo**: Coloque o arquivo `logo-sapere.jpg` em `public/`
2. **Componente**: Use `<Login />` nas rotas
3. **Otimizações**: O hook `useMobileOptimizations()` é aplicado automaticamente
4. **Personalização**: Ajuste as classes CSS conforme necessário

## 💝 **Experiência do Usuário**

A tela foi projetada para transmitir:
- **Confiança** através do design profissional
- **Acolhimento** através das cores suaves e animações
- **Eficiência** através da interface limpa e intuitiva
- **Acessibilidade** através do design responsivo e otimizações mobile

---

**Desenvolvido com ❤️ para a clínica Sapere**