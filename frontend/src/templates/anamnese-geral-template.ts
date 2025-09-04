// Template de anamnese geral baseado no formulário da clínica Sapere
import type { AnamneseTemplate } from '@/types/anamnese';

export const anamneseGeralTemplate: AnamneseTemplate = {
  id: 'anamnese-geral-sapere',
  nome: 'Anamnese Geral Sapere',
  descricao: 'Template padrão de anamnese para uso por todos os terapeutas do Centro de Desenvolvimento Sapere',
  categoria: 'multiprofissional',
  especialidade: ['fonoaudiologia', 'psicologia', 'terapia-ocupacional', 'fisioterapia', 'neuropsicologia', 'nutricao', 'musicoterapia'],
  template: {
    sections: [
      {
        title: 'Dados Pessoais',
        description: 'Informações básicas do paciente e família',
        fields: [
          {
            name: 'nome',
            type: 'text',
            label: 'Nome',
            required: true,
            placeholder: 'Nome completo do paciente'
          },
          {
            name: 'idade',
            type: 'number',
            label: 'Idade',
            required: true,
            validation: { min: 0, max: 120 }
          },
          {
            name: 'temApelido',
            type: 'radio',
            label: 'Tem apelido?',
            options: ['Sim', 'Não'],
            required: true
          },
          {
            name: 'qualApelido',
            type: 'text',
            label: 'Qual apelido?',
            placeholder: 'Nome do apelido'
          },
          {
            name: 'gostaApelido',
            type: 'radio',
            label: 'Ele(a) gosta do apelido?',
            options: ['Sim', 'Não']
          },
          {
            name: 'porqueApelido',
            type: 'text',
            label: 'Por que tem esse apelido?',
            placeholder: 'Motivo do apelido'
          },
          {
            name: 'dataNascimento',
            type: 'date',
            label: 'Data de Nascimento',
            required: true
          },
          {
            name: 'sexo',
            type: 'radio',
            label: 'Sexo',
            options: ['Masculino', 'Feminino'],
            required: true
          },
          {
            name: 'naturalidade',
            type: 'text',
            label: 'Naturalidade',
            placeholder: 'Cidade de nascimento'
          },
          {
            name: 'alergico',
            type: 'radio',
            label: 'É alérgico(a)?',
            options: ['Sim', 'Não'],
            required: true
          },
          {
            name: 'qualAlergia',
            type: 'text',
            label: 'Qual alergia?',
            placeholder: 'Descreva as alergias'
          },
          {
            name: 'endereco',
            type: 'text',
            label: 'Endereço',
            placeholder: 'Endereço completo'
          },
          {
            name: 'bairro',
            type: 'text',
            label: 'Bairro',
            placeholder: 'Nome do bairro'
          },
          {
            name: 'cidade',
            type: 'text',
            label: 'Cidade',
            placeholder: 'Nome da cidade'
          },
          {
            name: 'cep',
            type: 'text',
            label: 'CEP',
            placeholder: '00000-000'
          },
          {
            name: 'telefones',
            type: 'text',
            label: 'Telefones para contato',
            placeholder: '(00) 00000-0000'
          },
          {
            name: 'escola',
            type: 'text',
            label: 'Escola',
            placeholder: 'Nome da escola'
          },
          {
            name: 'serie',
            type: 'text',
            label: 'Série que cursa',
            placeholder: 'Ex: 3º ano'
          },
          {
            name: 'enderecoEscola',
            type: 'text',
            label: 'Endereço da escola',
            placeholder: 'Endereço da escola'
          },
          {
            name: 'telefoneEscola',
            type: 'text',
            label: 'Telefone da escola',
            placeholder: '(00) 0000-0000'
          },
          {
            name: 'contatoEscola',
            type: 'text',
            label: 'Contato na escola',
            placeholder: 'Nome do responsável'
          },
          {
            name: 'professora',
            type: 'text',
            label: 'Professora',
            placeholder: 'Nome da professora'
          },
          {
            name: 'horarioEscolar',
            type: 'text',
            label: 'Horário escolar',
            placeholder: 'Ex: 7:30 às 11:30'
          }
        ]
      },
      {
        title: 'Dados Familiares',
        description: 'Informações sobre os pais e irmãos',
        fields: [
          {
            name: 'nomePai',
            type: 'text',
            label: 'Nome do pai',
            placeholder: 'Nome completo do pai'
          },
          {
            name: 'idadePai',
            type: 'number',
            label: 'Idade do pai',
            validation: { min: 0, max: 120 }
          },
          {
            name: 'estudouAtePai',
            type: 'text',
            label: 'Pai estudou até',
            placeholder: 'Ex: Ensino Médio, Superior'
          },
          {
            name: 'dificuldadePai',
            type: 'radio',
            label: 'Pai teve dificuldade na escola?',
            options: ['Sim', 'Não']
          },
          {
            name: 'formouPai',
            type: 'radio',
            label: 'Pai se formou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'profissaoPai',
            type: 'text',
            label: 'Profissão do pai',
            placeholder: 'Profissão atual'
          },
          {
            name: 'nomeMae',
            type: 'text',
            label: 'Nome da mãe',
            placeholder: 'Nome completo da mãe'
          },
          {
            name: 'idadeMae',
            type: 'number',
            label: 'Idade da mãe',
            validation: { min: 0, max: 120 }
          },
          {
            name: 'estudouAteMae',
            type: 'text',
            label: 'Mãe estudou até',
            placeholder: 'Ex: Ensino Médio, Superior'
          },
          {
            name: 'dificuldadeMae',
            type: 'radio',
            label: 'Mãe teve dificuldade na escola?',
            options: ['Sim', 'Não']
          },
          {
            name: 'formouMae',
            type: 'radio',
            label: 'Mãe se formou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'profissaoMae',
            type: 'text',
            label: 'Profissão da mãe',
            placeholder: 'Profissão atual'
          },
          {
            name: 'esquemaFamiliar',
            type: 'textarea',
            label: 'Esquema familiar',
            placeholder: 'Descreva a composição e dinâmica familiar'
          },
          {
            name: 'irmaos',
            type: 'textarea',
            label: 'Irmãos (nome e idade)',
            placeholder: 'Liste os irmãos com nome e idade'
          }
        ]
      },
      {
        title: 'Queixa Principal',
        description: 'Motivo da consulta e diagnósticos',
        fields: [
          {
            name: 'queixa',
            type: 'textarea',
            label: 'Queixa principal',
            required: true,
            placeholder: 'Descreva o motivo da consulta e principais preocupações'
          },
          {
            name: 'diagnostico',
            type: 'textarea',
            label: 'Diagnóstico',
            placeholder: 'Diagnósticos médicos já estabelecidos'
          }
        ]
      },
      {
        title: 'Concepção e Gestação',
        description: 'Histórico gestacional e do parto',
        fields: [
          {
            name: 'filhoDesejado',
            type: 'radio',
            label: 'Filho(a) desejado(a)?',
            options: ['Sim', 'Não']
          },
          {
            name: 'gravidezPlanejada',
            type: 'radio',
            label: 'Gravidez foi planejada?',
            options: ['Sim', 'Não']
          },
          {
            name: 'modificacaoVidaCasal',
            type: 'radio',
            label: 'Houve modificação na vida do casal?',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisModificacoes',
            type: 'text',
            label: 'Quais modificações?',
            placeholder: 'Descreva as mudanças'
          },
          {
            name: 'historiaGestacional',
            type: 'textarea',
            label: 'História gestacional',
            placeholder: 'Pré-natal, aspectos emocionais, adoecimentos, condições da gravidez'
          },
          {
            name: 'historicoParto',
            type: 'textarea',
            label: 'Histórico do parto',
            placeholder: 'Tipo de parto, sofrimento fetal, má oxigenação, lesões, condições do RN, intercorrências, amamentação'
          },
          {
            name: 'antecedentesFamiliares',
            type: 'textarea',
            label: 'Antecedentes familiares',
            placeholder: 'Se apresenta outros casos na família'
          },
          {
            name: 'historicoAcompanhamento',
            type: 'textarea',
            label: 'Histórico de acompanhamento multiprofissional e saúde',
            placeholder: 'Equipe que é acompanhado, uso de medicação, alergias e internações'
          }
        ]
      },
      {
        title: 'Hábitos Alimentares',
        description: 'Comportamentos relacionados à alimentação',
        fields: [
          {
            name: 'mamou',
            type: 'radio',
            label: 'Mamou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'periodoAmamentacao',
            type: 'text',
            label: 'Período de amamentação',
            placeholder: 'Ex: 6 meses'
          },
          {
            name: 'transicaoPapinha',
            type: 'radio',
            label: 'Transição para papinha foi rápida?',
            options: ['Sim', 'Não']
          },
          {
            name: 'horarioFixoComer',
            type: 'radio',
            label: 'Tem horário fixo para comer?',
            options: ['Sim', 'Não']
          },
          {
            name: 'qualHorario',
            type: 'text',
            label: 'Qual horário?',
            placeholder: 'Ex: 7h, 12h, 18h'
          },
          {
            name: 'comeDepressa',
            type: 'radio',
            label: 'Come depressa?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comemJuntosMesa',
            type: 'radio',
            label: 'Comem juntos à mesa?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comeAssistindoTela',
            type: 'radio',
            label: 'Come assistindo tela?',
            options: ['Sim', 'Não']
          },
          {
            name: 'usaMamadeira',
            type: 'radio',
            label: 'Usa mamadeira?',
            options: ['Sim', 'Não']
          },
          {
            name: 'seletividadeAlimentar',
            type: 'radio',
            label: 'Tem seletividade alimentar?',
            options: ['Sim', 'Não']
          },
          {
            name: 'qualSeletividade',
            type: 'text',
            label: 'Qual seletividade?',
            placeholder: 'Descreva os alimentos rejeitados/preferidos'
          },
          {
            name: 'mastigaBem',
            type: 'radio',
            label: 'Mastiga bem?',
            options: ['Sim', 'Não']
          },
          {
            name: 'exploraAlimentos',
            type: 'radio',
            label: 'Explora alimentos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAnsia',
            type: 'radio',
            label: 'Tem ânsia?',
            options: ['Sim', 'Não']
          },
          {
            name: 'rejeitaAlimentos',
            type: 'radio',
            label: 'Rejeita alimentos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'usaTalheres',
            type: 'radio',
            label: 'Usa talheres?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoCriancaCome',
            type: 'textarea',
            label: 'Como a criança come?',
            placeholder: 'Descreva o comportamento durante as refeições'
          },
          {
            name: 'preferenciaAlimentar',
            type: 'textarea',
            label: 'Preferência alimentar',
            placeholder: 'Alimentos preferidos e rejeitados'
          }
        ]
      },
      {
        title: 'Sono',
        description: 'Padrões e problemas relacionados ao sono',
        fields: [
          {
            name: 'sonoTranquilo',
            type: 'radio',
            label: 'Sono tranquilo?',
            options: ['Sim', 'Não']
          },
          {
            name: 'agitado',
            type: 'radio',
            label: 'É agitado?',
            options: ['Sim', 'Não']
          },
          {
            name: 'acordaVariasVezes',
            type: 'radio',
            label: 'Acorda várias vezes na noite?',
            options: ['Sim', 'Não']
          },
          {
            name: 'demoraParaDormir',
            type: 'radio',
            label: 'Demora para dormir?',
            options: ['Sim', 'Não']
          },
          {
            name: 'problemaSono',
            type: 'radio',
            label: 'Tem problema de sono?',
            options: ['Sim', 'Não']
          },
          {
            name: 'qualProblemaSono',
            type: 'text',
            label: 'Qual problema de sono?',
            placeholder: 'Descreva o problema'
          },
          {
            name: 'usaTelaAntesDormir',
            type: 'radio',
            label: 'Usa tela antes de dormir?',
            options: ['Sim', 'Não']
          },
          {
            name: 'sonambulo',
            type: 'radio',
            label: 'É sonâmbulo?',
            options: ['Sim', 'Não']
          },
          {
            name: 'temPesadelos',
            type: 'radio',
            label: 'Tem pesadelos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'horasDorme',
            type: 'text',
            label: 'Que horas dorme?',
            placeholder: 'Ex: 21:00'
          },
          {
            name: 'horasAcorda',
            type: 'text',
            label: 'Que horas acorda?',
            placeholder: 'Ex: 7:00'
          },
          {
            name: 'criancaAcordadaSozinha',
            type: 'text',
            label: 'A criança é acordada ou acorda sozinha?',
            placeholder: 'Descreva'
          },
          {
            name: 'dormeSoAcompanhado',
            type: 'text',
            label: 'Dorme só ou acompanhado?',
            placeholder: 'Descreva'
          },
          {
            name: 'comQuantasPessoas',
            type: 'text',
            label: 'Com quantas pessoas?',
            placeholder: 'Número de pessoas'
          },
          {
            name: 'vaiCamaPais',
            type: 'radio',
            label: 'Quando acorda vai para a cama dos pais?',
            options: ['Sim', 'Não']
          },
          {
            name: 'medoDormirSozinho',
            type: 'radio',
            label: 'Tem medo de dormir sozinho?',
            options: ['Sim', 'Não']
          },
          {
            name: 'enureseNoturna',
            type: 'radio',
            label: 'Enurese noturna?',
            options: ['Sim', 'Não']
          },
          {
            name: 'ronca',
            type: 'radio',
            label: 'Ronca?',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Hábitos de Eliminação',
        description: 'Controle esfincteriano e eliminações',
        fields: [
          {
            name: 'usaFraldas',
            type: 'radio',
            label: 'Usa fraldas?',
            options: ['Sim', 'Não']
          },
          {
            name: 'periodoFraldas',
            type: 'text',
            label: 'Período de uso das fraldas',
            placeholder: 'Ex: até 3 anos'
          },
          {
            name: 'idadeDesfralde',
            type: 'text',
            label: 'Com que idade realizou desfralde?',
            placeholder: 'Ex: 2 anos e 6 meses'
          },
          {
            name: 'utilizaVasoTroninho',
            type: 'radio',
            label: 'Utiliza vaso e/ou troninho?',
            options: ['Sim', 'Não']
          },
          {
            name: 'passagemTroninho',
            type: 'checkbox',
            label: 'Como foi a passagem para o troninho?',
            options: ['Segurava', 'Molhava a roupa', 'Brincava', 'Saía correndo', 'Era repreendido', 'Chorava']
          },
          {
            name: 'outrosPassagemTroninho',
            type: 'text',
            label: 'Outros comportamentos na passagem para o troninho',
            placeholder: 'Outros comportamentos observados'
          },
          {
            name: 'comoEramFezes',
            type: 'radio',
            label: 'Como eram as fezes?',
            options: ['Líquida', 'Pastosa', 'Ressecada', 'Normal']
          }
        ]
      },
      {
        title: 'Desenvolvimento Motor',
        description: 'Marcos do desenvolvimento motor',
        fields: [
          {
            name: 'controleCervical',
            type: 'text',
            label: 'Controle cervical',
            placeholder: 'Idade em que sustentou a cabeça'
          },
          {
            name: 'engatinhou',
            type: 'radio',
            label: 'Engatinhou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoFoiEngatinhar',
            type: 'text',
            label: 'Como foi esse engatinhar?',
            placeholder: 'Descreva o padrão de engatinhar'
          },
          {
            name: 'eraCorajosoExplorar',
            type: 'radio',
            label: 'Era corajoso explorando, engatinhando um novo espaço?',
            options: ['Sim', 'Não']
          },
          {
            name: 'sentou',
            type: 'radio',
            label: 'Sentou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoFoiSentar',
            type: 'text',
            label: 'Como foi esse sentar?',
            placeholder: 'Descreva como a criança sentou'
          },
          {
            name: 'andou',
            type: 'radio',
            label: 'Andou?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comQueIdadeAndou',
            type: 'text',
            label: 'Com que idade andou?',
            placeholder: 'Ex: 1 ano e 2 meses'
          },
          {
            name: 'quemEnsinouAndar',
            type: 'text',
            label: 'Quem ensinou a andar?',
            placeholder: 'Quem ajudou no processo'
          },
          {
            name: 'ficouCercadinho',
            type: 'radio',
            label: 'Ficou no cercadinho?',
            options: ['Sim', 'Não']
          },
          {
            name: 'caiaMuito',
            type: 'radio',
            label: 'Caía muito?',
            options: ['Sim', 'Não']
          },
          {
            name: 'mostravaCorajosSubirEscada',
            type: 'radio',
            label: 'Mostrava-se corajoso ao subir uma escada?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comQuemAndavaMelhor',
            type: 'text',
            label: 'Com quem andava melhor?',
            placeholder: 'Com qual pessoa se sentia mais seguro'
          },
          {
            name: 'evolucaoMovimentosFinos',
            type: 'textarea',
            label: 'Como evoluiu a coordenação dos movimentos finos?',
            placeholder: 'Segurar um brinquedo, uma colher, rabiscos que fazia'
          },
          {
            name: 'evolucaoGrandesMusulos',
            type: 'textarea',
            label: 'E dos grandes músculos?',
            placeholder: 'Chutar uma bola, correr'
          }
        ]
      },
      {
        title: 'Desenvolvimento Motor Atual',
        description: 'Habilidades motoras atuais',
        fields: [
          {
            name: 'estabanado',
            type: 'radio',
            label: 'É estabanado(a)?',
            options: ['Sim', 'Não']
          },
          {
            name: 'nada',
            type: 'radio',
            label: 'Nada?',
            options: ['Sim', 'Não']
          },
          {
            name: 'agitadoAtual',
            type: 'radio',
            label: 'É agitado(a)?',
            options: ['Sim', 'Não']
          },
          {
            name: 'andaPatins',
            type: 'radio',
            label: 'Anda de patins?',
            options: ['Sim', 'Não']
          },
          {
            name: 'andaBicicleta',
            type: 'radio',
            label: 'Anda de bicicleta sem rodinha?',
            options: ['Sim', 'Não']
          },
          {
            name: 'andaCavalo',
            type: 'radio',
            label: 'Anda a cavalo?',
            options: ['Sim', 'Não']
          },
          {
            name: 'sobeArvores',
            type: 'radio',
            label: 'Sobe em árvores?',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Funções Sensório-Motoras',
        description: 'Aspectos sensoriais e motores',
        fields: [
          {
            name: 'tonus',
            type: 'radio',
            label: 'Tônus',
            options: ['Hipotonia', 'Normotonia', 'Hipertonia']
          },
          {
            name: 'reageTexturas',
            type: 'radio',
            label: 'Reage a texturas?',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisTexturas',
            type: 'text',
            label: 'Quais texturas?',
            placeholder: 'Descreva as texturas que causam reação'
          },
          {
            name: 'reclamaDor',
            type: 'radio',
            label: 'Reclama de dor?',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Linguagem',
        description: 'Desenvolvimento e características da linguagem',
        fields: [
          {
            name: 'linguagem',
            type: 'radio',
            label: 'Linguagem',
            options: ['Verbal', 'Não verbal'],
            required: true
          },
          {
            name: 'idadeComecouFalar',
            type: 'text',
            label: 'Com que idade começou a falar?',
            placeholder: 'Ex: 1 ano e 6 meses'
          },
          {
            name: 'comQuemFalavaMais',
            type: 'text',
            label: 'Com quem falava mais?',
            placeholder: 'Com qual pessoa se comunicava melhor'
          },
          {
            name: 'falavamParaRepetir',
            type: 'radio',
            label: 'Falava(m) para ele(a) repetir?',
            options: ['Sim', 'Não']
          },
          {
            name: 'primeirasPalavras',
            type: 'text',
            label: 'Quais foram as primeiras palavras?',
            placeholder: 'Ex: mamã, papá, água'
          },
          {
            name: 'trocavaLetras',
            type: 'radio',
            label: 'Trocava letras?',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisLetrasTrocava',
            type: 'text',
            label: 'Quais letras trocava?',
            placeholder: 'Ex: R por L'
          },
          {
            name: 'falavaMuitoErrado',
            type: 'radio',
            label: 'Falava muito errado?',
            options: ['Sim', 'Não']
          },
          {
            name: 'falaMuitoPoucoAnsioso',
            type: 'radio',
            label: 'Fala muito/pouco (ansioso)?',
            options: ['Sim', 'Não']
          },
          {
            name: 'falaFormaEntendem',
            type: 'radio',
            label: 'Fala de uma forma que todos entendem?',
            options: ['Sim', 'Não']
          },
          {
            name: 'consegueDarRecado',
            type: 'radio',
            label: 'Consegue dar um recado?',
            options: ['Sim', 'Não']
          },
          {
            name: 'contaHistoria',
            type: 'radio',
            label: 'Conta uma história/um caso/uma novela?',
            options: ['Sim', 'Não']
          },
          {
            name: 'historiasComecoMeioFim',
            type: 'radio',
            label: 'As histórias possuem começo, meio e fim?',
            options: ['Sim', 'Não']
          },
          {
            name: 'indicaQueQuer',
            type: 'radio',
            label: 'Indica o que ele quer?',
            options: ['Sim', 'Não']
          },
          {
            name: 'indicaQueNaoQuer',
            type: 'radio',
            label: 'Indica o que ele não quer?',
            options: ['Sim', 'Não']
          },
          {
            name: 'fazGestosComunicar',
            type: 'radio',
            label: 'Faz uso de gestos para se comunicar?',
            options: ['Sim', 'Não']
          },
          {
            name: 'entendeDuasInstrucoes',
            type: 'radio',
            label: 'É uma criança que entende duas ou mais instruções?',
            options: ['Sim', 'Não']
          },
          {
            name: 'comentaQueElaFaz',
            type: 'radio',
            label: 'É uma criança que comenta o que ela faz?',
            options: ['Sim', 'Não']
          },
          {
            name: 'compreendesentimentos',
            type: 'radio',
            label: 'Compreende sentimentos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'compartilhaQuesSente',
            type: 'radio',
            label: 'Compartilha o que sente?',
            options: ['Sim', 'Não']
          },
          {
            name: 'temEcolalia',
            type: 'radio',
            label: 'Tem ecolalia?',
            options: ['Sim', 'Não']
          },
          {
            name: 'falaConsigoMesma',
            type: 'radio',
            label: 'Fala consigo mesma?',
            options: ['Sim', 'Não']
          },
          {
            name: 'repeteFalasVideo',
            type: 'radio',
            label: 'Repete falas de vídeo, filmes ou desenhos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'temFalaInapropriada',
            type: 'radio',
            label: 'Tem fala inapropriada?',
            options: ['Sim', 'Não']
          },
          {
            name: 'buscaPontoArticulatorio',
            type: 'radio',
            label: 'Busca ponto articulatório?',
            options: ['Sim', 'Não']
          },
          {
            name: 'dificuldadeProducao',
            type: 'radio',
            label: 'Dificuldade de produção?',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Motricidade',
        description: 'Aspectos da motricidade oral e geral',
        fields: [
          {
            name: 'chupeta',
            type: 'radio',
            label: 'Chupeta',
            options: ['Sim', 'Não']
          },
          {
            name: 'chupaDedo',
            type: 'radio',
            label: 'Chupa o dedo',
            options: ['Sim', 'Não']
          },
          {
            name: 'usaCopoCanudo',
            type: 'radio',
            label: 'Usa copo de canudo',
            options: ['Sim', 'Não']
          },
          {
            name: 'temEscapeAlimentar',
            type: 'radio',
            label: 'Tem escape enquanto se alimenta',
            options: ['Sim', 'Não']
          },
          {
            name: 'babaNoTravesseiro',
            type: 'radio',
            label: 'Baba no travesseiro',
            options: ['Sim', 'Não']
          },
          {
            name: 'respiraPelaBoca',
            type: 'radio',
            label: 'Respira pela boca',
            options: ['Sim', 'Não']
          },
          {
            name: 'marcha',
            type: 'radio',
            label: 'Marcha',
            options: ['Sim', 'Não']
          },
          {
            name: 'padraoPatologico',
            type: 'text',
            label: 'Padrão Patológico',
            placeholder: 'Descreva se há padrão patológico na marcha'
          },
          {
            name: 'saltar',
            type: 'radio',
            label: 'Saltar',
            options: ['Sim', 'Não']
          },
          {
            name: 'chutar',
            type: 'radio',
            label: 'Chutar',
            options: ['Sim', 'Não']
          },
          {
            name: 'imitarMovimentos',
            type: 'radio',
            label: 'Imitar movimentos',
            options: ['Sim', 'Não']
          },
          {
            name: 'lancarObjetos',
            type: 'radio',
            label: 'Lançar objetos',
            options: ['Sim', 'Não']
          },
          {
            name: 'subirDescerEscadas',
            type: 'radio',
            label: 'Subir e descer escadas',
            options: ['Sim', 'Não']
          },
          {
            name: 'correr',
            type: 'radio',
            label: 'Correr',
            options: ['Sim', 'Não']
          },
          {
            name: 'dominanciaLateral',
            type: 'radio',
            label: 'Dominância lateral',
            options: ['Destro', 'Sinistro', 'Ambidestra', 'Não definido']
          },
          {
            name: 'manipulaObjetos',
            type: 'radio',
            label: 'Manipula objetos',
            options: ['Sim', 'Não']
          },
          {
            name: 'realizaPincas',
            type: 'radio',
            label: 'Realiza pinças',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Audição',
        description: 'Aspectos auditivos',
        fields: [
          {
            name: 'teveOtite',
            type: 'radio',
            label: 'Teve otite',
            options: ['Sim', 'Não']
          },
          {
            name: 'direcionaOlharQuemFala',
            type: 'radio',
            label: 'Direciona o olhar para quem está falando',
            options: ['Sim', 'Não']
          },
          {
            name: 'direcionaFonteSonora',
            type: 'radio',
            label: 'Direciona para fonte sonora',
            options: ['Sim', 'Não']
          },
          {
            name: 'dificuldadeAmbienteBarulhento',
            type: 'radio',
            label: 'A criança sente dificuldade em ambiente barulhento',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisDificuldadesAmbiente',
            type: 'text',
            label: 'Quais dificuldades no ambiente?',
            placeholder: 'Descreva as dificuldades'
          },
          {
            name: 'realizouExameAuditivo',
            type: 'radio',
            label: 'A criança realizou exame auditivo',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisExamesAuditivos',
            type: 'text',
            label: 'Quais exames auditivos?',
            placeholder: 'Descreva os exames realizados'
          }
        ]
      },
      {
        title: 'Aspectos Cognitivos',
        description: 'Desenvolvimento cognitivo e aprendizagem',
        fields: [
          {
            name: 'jaFazConta',
            type: 'radio',
            label: 'Já faz conta',
            options: ['Sim', 'Não']
          },
          {
            name: 'conheceAlfabeto',
            type: 'radio',
            label: 'Conhece o alfabeto',
            options: ['Sim', 'Não']
          },
          {
            name: 'conheceNumeros',
            type: 'radio',
            label: 'Conhece os números',
            options: ['Sim', 'Não']
          },
          {
            name: 'conheceFormasGeometricas',
            type: 'radio',
            label: 'Conhece as formas geométricas',
            options: ['Sim', 'Não']
          },
          {
            name: 'demonstraMemoria',
            type: 'radio',
            label: 'Demonstra memória',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAtencao',
            type: 'radio',
            label: 'Tem atenção',
            options: ['Baixa', 'Normal']
          },
          {
            name: 'temConcentracao',
            type: 'radio',
            label: 'Tem concentração',
            options: ['Baixa', 'Normal']
          },
          {
            name: 'demonstraIniciativa',
            type: 'radio',
            label: 'Demonstra iniciativa',
            options: ['Sim', 'Não']
          },
          {
            name: 'demonstraTolerancia',
            type: 'radio',
            label: 'Demonstra tolerância',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Senso Percepção',
        description: 'Aspectos da senso percepção',
        fields: [
          {
            name: 'reageALuz',
            type: 'radio',
            label: 'Reage a luz',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisLuzes',
            type: 'text',
            label: 'Quais luzes?',
            placeholder: 'Descreva as reações à luz'
          },
          {
            name: 'comoReageLuz',
            type: 'text',
            label: 'Como reage à luz?',
            placeholder: 'Descreva a forma de reação'
          },
          {
            name: 'reageASons',
            type: 'radio',
            label: 'Reage a sons',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisSons',
            type: 'text',
            label: 'Quais sons?',
            placeholder: 'Descreva os sons que causam reação'
          },
          {
            name: 'comoReageSons',
            type: 'text',
            label: 'Como reage aos sons?',
            placeholder: 'Descreva a forma de reação'
          },
          {
            name: 'levaObjetosBoca',
            type: 'radio',
            label: 'Leva objetos à boca',
            options: ['Sim', 'Não']
          },
          {
            name: 'cheiraObjetos',
            type: 'radio',
            label: 'Cheira objetos',
            options: ['Sim', 'Não']
          },
          {
            name: 'reageMovimentoCarro',
            type: 'radio',
            label: 'Reage com movimento de carro ou corporal',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoReageMovimento',
            type: 'text',
            label: 'Como reage ao movimento?',
            placeholder: 'Descreva a reação'
          }
        ]
      },
      {
        title: 'Aspectos Psico Emocionais e Relacionais',
        description: 'Comportamento social e emocional',
        fields: [
          {
            name: 'socializaOutrasPessoas',
            type: 'radio',
            label: 'Se socializa com outras pessoas',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoSocializa',
            type: 'text',
            label: 'Como se socializa?',
            placeholder: 'Descreva a forma de socialização'
          },
          {
            name: 'brincaOutrasCriancas',
            type: 'radio',
            label: 'Brinca com outras crianças',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoBrinca',
            type: 'text',
            label: 'Como brinca?',
            placeholder: 'Descreva o estilo de brincadeira'
          },
          {
            name: 'compartilhaBrinquedos',
            type: 'radio',
            label: 'Compartilha brinquedos',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoCompartilha',
            type: 'text',
            label: 'Como compartilha?',
            placeholder: 'Descreva o comportamento de compartilhamento'
          },
          {
            name: 'aceitaNao',
            type: 'radio',
            label: 'Aceita não',
            options: ['Sim', 'Não']
          },
          {
            name: 'comoReageFrustracoes',
            type: 'checkbox',
            label: 'Como reage diante das frustrações?',
            options: ['Birra', 'Choro', 'Joga no chão', 'Agressividade', 'Auto agressão']
          },
          {
            name: 'roeUnhas',
            type: 'radio',
            label: 'Roe unhas',
            options: ['Sim', 'Não']
          },
          {
            name: 'apertaRangeDentes',
            type: 'radio',
            label: 'Aperta ou range os dentes',
            options: ['Sim', 'Não']
          },
          {
            name: 'diurnoNoturno',
            type: 'text',
            label: 'Diurno/noturno',
            placeholder: 'Quando ocorre o ranger de dentes'
          },
          {
            name: 'fazUsoReforcadores',
            type: 'radio',
            label: 'Faz uso de reforçadores',
            options: ['Sim', 'Não']
          },
          {
            name: 'quaisReforcadores',
            type: 'text',
            label: 'Quais reforçadores?',
            placeholder: 'Descreva os reforçadores utilizados'
          },
          {
            name: 'enureseNoturnaEmocional',
            type: 'radio',
            label: 'Enurese noturna',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAcessoTelas',
            type: 'radio',
            label: 'Tem acesso a telas',
            options: ['Sim', 'Não']
          },
          {
            name: 'quantoTempoTelas',
            type: 'text',
            label: 'Quanto tempo?',
            placeholder: 'Ex: 2 horas por dia'
          },
          {
            name: 'relacionamentoFamiliares',
            type: 'text',
            label: 'Como é o relacionamento com familiares?',
            placeholder: 'Descreva a dinâmica familiar'
          },
          {
            name: 'padroesComportamentoRepetitivo',
            type: 'radio',
            label: 'Padrões de comportamento repetitivo',
            options: ['Ritual', 'Outro']
          },
          {
            name: 'oQueFazParaSeAcalmar',
            type: 'text',
            label: 'O que faz para se acalmar?',
            placeholder: 'Estratégias de autorregulação'
          },
          {
            name: 'desafioComportamentoCasaSociedade',
            type: 'text',
            label: 'Desafio de comportamento em casa ou na sociedade?',
            placeholder: 'Descreva os desafios comportamentais'
          },
          {
            name: 'temAmigos',
            type: 'radio',
            label: 'Tem amigos?',
            options: ['Sim', 'Não']
          },
          {
            name: 'quemAmigos',
            type: 'text',
            label: 'Quem são os amigos?',
            placeholder: 'Nome dos amigos'
          },
          {
            name: 'saiOutrasCriancas',
            type: 'radio',
            label: 'Sai com outras crianças?',
            options: ['Sim', 'Não']
          },
          {
            name: 'fazAmigoFacilidade',
            type: 'radio',
            label: 'Faz amigo com facilidade?',
            options: ['Sim', 'Não']
          },
          {
            name: 'chegaParqueBrincaImediato',
            type: 'radio',
            label: 'Chega no parque e começa a brincar de imediato?',
            options: ['Sim', 'Não']
          },
          {
            name: 'gostaMusica',
            type: 'radio',
            label: 'Gosta de música?',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Escolaridade/Estimulação',
        description: 'Vida escolar e estimulação',
        fields: [
          {
            name: 'jaEstuda',
            type: 'radio',
            label: 'Já estuda',
            options: ['Sim', 'Não']
          },
          {
            name: 'serieEstuda',
            type: 'text',
            label: 'Série',
            placeholder: 'Série que está cursando'
          },
          {
            name: 'jaTrocouEscola',
            type: 'radio',
            label: 'Já trocou de escola?',
            options: ['Sim', 'Não']
          },
          {
            name: 'motivoTrocaEscola',
            type: 'text',
            label: 'Motivo da troca?',
            placeholder: 'Por que trocou de escola'
          },
          {
            name: 'comoFoiAdaptacaoEscola',
            type: 'text',
            label: 'Como foi adaptação da criança na escola?',
            placeholder: 'Descreva o processo de adaptação'
          },
          {
            name: 'comeLancheEscola',
            type: 'radio',
            label: 'Come lanche na escola?',
            options: ['Sim', 'Não']
          },
          {
            name: 'relacionamentoProfessores',
            type: 'text',
            label: 'Relacionamento da criança com os professores?',
            placeholder: 'Como se relaciona com os educadores'
          },
          {
            name: 'temDificuldadeAprendizagem',
            type: 'text',
            label: 'Tem dificuldade de aprendizagem? Quais?',
            placeholder: 'Descreva as dificuldades específicas'
          },
          {
            name: 'temRotinaEstudo',
            type: 'radio',
            label: 'Tem rotina de estudo?',
            options: ['Sim', 'Não']
          },
          {
            name: 'tempoEspera',
            type: 'radio',
            label: 'Tempo de espera',
            options: ['Baixo', 'Normal']
          },
          {
            name: 'ficaSentadoAtividades',
            type: 'radio',
            label: 'Fica sentado para realizar atividades',
            options: ['Sim', 'Não']
          },
          {
            name: 'atendeComandos',
            type: 'radio',
            label: 'Atende a comandos',
            options: ['Sim', 'Não']
          },
          {
            name: 'aceitaTrocaTurno',
            type: 'radio',
            label: 'Aceita troca de turno',
            options: ['Sim', 'Não']
          },
          {
            name: 'realizaAtividadesPropostas',
            type: 'radio',
            label: 'Realiza as atividades propostas',
            options: ['Sim', 'Não']
          },
          {
            name: 'temMediador',
            type: 'radio',
            label: 'Tem mediador',
            options: ['Sim', 'Não']
          },
          {
            name: 'mostraInteresseAprender',
            type: 'radio',
            label: 'Mostra interesse em aprender',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAcessoBrinquedosPedagogicos',
            type: 'radio',
            label: 'Tem acesso a brinquedos pedagógicos',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAcessoJogos',
            type: 'radio',
            label: 'Tem acesso a jogos',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAcessoRevistasLivros',
            type: 'radio',
            label: 'Tem acesso a revistas/livros',
            options: ['Sim', 'Não']
          },
          {
            name: 'temAcessoBrinquedosEletronicos',
            type: 'radio',
            label: 'Tem acesso a brinquedos eletrônicos',
            options: ['Sim', 'Não']
          },
          {
            name: 'participaAtividadeMusica',
            type: 'radio',
            label: 'Participa de atividade de música',
            options: ['Sim', 'Não']
          },
          {
            name: 'participaAtividadeDanca',
            type: 'radio',
            label: 'Participa de atividade de dança',
            options: ['Sim', 'Não']
          },
          {
            name: 'participaAtividadeEsporte',
            type: 'radio',
            label: 'Participa de atividade de esporte',
            options: ['Sim', 'Não']
          },
          {
            name: 'outrasAtividades',
            type: 'text',
            label: 'Outras atividades',
            placeholder: 'Outras atividades que participa'
          }
        ]
      },
      {
        title: 'Ocupações/AVDs',
        description: 'Atividades de vida diária',
        fields: [
          {
            name: 'seVesteSozinha',
            type: 'radio',
            label: 'Se veste sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'escovadentesSozinha',
            type: 'radio',
            label: 'Escova os dentes sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'aceitaCremeDental',
            type: 'radio',
            label: 'Aceita creme dental',
            options: ['Sim', 'Não']
          },
          {
            name: 'mordeEscova',
            type: 'radio',
            label: 'Morde a escova',
            options: ['Sim', 'Não']
          },
          {
            name: 'cospeBochecha',
            type: 'radio',
            label: 'Cospe e bochecha',
            options: ['Sim', 'Não']
          },
          {
            name: 'lavaMaosSozinha',
            type: 'radio',
            label: 'Lava as mãos sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'seLimpaSoUsoBanheiro',
            type: 'radio',
            label: 'Se limpa só após uso do banheiro',
            options: ['Sim', 'Não']
          },
          {
            name: 'tomaBanhoSozinha',
            type: 'radio',
            label: 'Toma banho sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'seEsfregaSozinha',
            type: 'radio',
            label: 'Se esfrega sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'aceitaTexturasBanho',
            type: 'radio',
            label: 'Aceita texturas durante o banho',
            options: ['Sim', 'Não']
          },
          {
            name: 'seAlimentaSozinha',
            type: 'radio',
            label: 'Se alimenta sozinha',
            options: ['Sim', 'Não']
          },
          {
            name: 'comeComMao',
            type: 'radio',
            label: 'Come com a mão',
            options: ['Sim', 'Não']
          },
          {
            name: 'serveAlimento',
            type: 'radio',
            label: 'Serve o alimento',
            options: ['Sim', 'Não']
          },
          {
            name: 'preparaLanchesSimples',
            type: 'radio',
            label: 'Prepara lanches simples',
            options: ['Sim', 'Não']
          },
          {
            name: 'usaTalher',
            type: 'radio',
            label: 'Usa talher',
            options: ['Sim', 'Não']
          },
          {
            name: 'retiraSapatos',
            type: 'radio',
            label: 'Retira sapatos',
            options: ['Sim', 'Não']
          },
          {
            name: 'retiraCamisa',
            type: 'radio',
            label: 'Retira camisa',
            options: ['Sim', 'Não']
          },
          {
            name: 'calcaMeia',
            type: 'radio',
            label: 'Calça meia',
            options: ['Sim', 'Não']
          },
          {
            name: 'retiraShorts',
            type: 'radio',
            label: 'Retira shorts',
            options: ['Sim', 'Não']
          },
          {
            name: 'manejaBotoesZiper',
            type: 'radio',
            label: 'Maneja botões e zíper',
            options: ['Sim', 'Não']
          },
          {
            name: 'calcaSapatos',
            type: 'radio',
            label: 'Calça sapatos',
            options: ['Sim', 'Não']
          },
          {
            name: 'vesteBlusa',
            type: 'radio',
            label: 'Veste a blusa',
            options: ['Sim', 'Não']
          },
          {
            name: 'vesteShortsRoupaIntima',
            type: 'radio',
            label: 'Veste shorts, cueca e calças',
            options: ['Sim', 'Não']
          },
          {
            name: 'retiraVesteAgasalho',
            type: 'radio',
            label: 'Retira e veste agasalho',
            options: ['Sim', 'Não']
          }
        ]
      },
      {
        title: 'Participação Social/Brincar',
        description: 'Comportamentos lúdicos e sociais',
        fields: [
          {
            name: 'brinquedoFavorito',
            type: 'text',
            label: 'Qual o brinquedo favorito?',
            placeholder: 'Descreva o brinquedo preferido'
          },
          {
            name: 'oQueFamiliaFazDescanso',
            type: 'text',
            label: 'O que a família faz no descanso?',
            placeholder: 'Atividades familiares de lazer'
          },
          {
            name: 'temasInteresseCrianca',
            type: 'text',
            label: 'Quais os temas de interesse da criança?',
            placeholder: 'Assuntos que mais interessam'
          },
          {
            name: 'aceitaRegrasSociais',
            type: 'radio',
            label: 'Aceita regras sociais e limites',
            options: ['Sim', 'Não']
          },
          {
            name: 'tipoBrincar',
            type: 'radio',
            label: 'Tipo de brincar',
            options: ['Funcional', 'Simbólico']
          },
          {
            name: 'enfileiraBrinquedos',
            type: 'radio',
            label: 'Enfileira brinquedos',
            options: ['Sim', 'Não']
          },
          {
            name: 'separaPorCores',
            type: 'radio',
            label: 'Separa por cores',
            options: ['Sim', 'Não']
          },
          {
            name: 'usaAdultoBrincadeira',
            type: 'radio',
            label: 'Usa o adulto durante a brincadeira',
            options: ['Sim', 'Não']
          },
          {
            name: 'repeteMesmaBrincadeira',
            type: 'radio',
            label: 'Repete a mesma brincadeira',
            options: ['Sim', 'Não']
          },
          {
            name: 'empilhaObjetos',
            type: 'radio',
            label: 'Empilha objetos',
            options: ['Sim', 'Não']
          },
          {
            name: 'poeRegrasBrincadeira',
            type: 'radio',
            label: 'Põe regras na brincadeira',
            options: ['Sim', 'Não']
          },
          {
            name: 'preferenciaBrincarComQuem',
            type: 'text',
            label: 'Tem preferência em brincar com quem?',
            placeholder: 'Com quem prefere brincar'
          },
          {
            name: 'noBrincarCriancaEh',
            type: 'checkbox',
            label: 'No brincar a criança é um par:',
            options: ['Ativo', 'Calmo', 'Passivo', 'Exploratório', 'Inflexível']
          },
          {
            name: 'gostaExplorarBrinquedos',
            type: 'checkbox',
            label: 'Gosta de explorar os brinquedos de forma:',
            options: ['Visual', 'Auditiva', 'Com o toque']
          }
        ]
      },
      {
        title: 'Observações e Parecer',
        description: 'Observações complementares e avaliação profissional',
        fields: [
          {
            name: 'observacoesComplementares',
            type: 'textarea',
            label: 'Observações complementares',
            placeholder: 'Expectativa da família, outras queixas'
          },
          {
            name: 'parecerConclusivo',
            type: 'textarea',
            label: 'Parecer conclusivo',
            placeholder: 'Indicação de terapias e frequência'
          },
          {
            name: 'conduta',
            type: 'textarea',
            label: 'Conduta',
            placeholder: 'Individual de cada área'
          }
        ]
      }
    ]
  },
  ativo: true,
  versao: 1,
  criadoPor: 'Sistema Sapere',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};