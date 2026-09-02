const fs = require('fs');

function driveLink(id) {
  return 'https://drive.google.com/file/d/' + id + '/preview';
}

const videos = [
  // ADVOCACIA
  { title: 'Melhor Advogado Penal (POV)', category: 'Advocacia', description: 'Edição dinâmica de retenção para nicho jurídico', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('1bLcZLpU4j3RiRAOMNn-QkOIKFwzUSB5m') },
  { title: 'Advocacia 01', category: 'Advocacia', description: 'Vídeo institucional com cortes rápidos', tools: 'Premiere Pro', duration: '0:40', driveLink: driveLink('1zQvafdACuEKgflBP5dZXlroDVCQ18D1j') },
  { title: 'Advocacia 02', category: 'Advocacia', description: 'Conteúdo informativo para posicionamento', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('13tCNF5JrMe3RwqFOs4EnRS2XlUbJq7yK') },
  { title: 'Advocacia 03', category: 'Advocacia', description: 'Reels estratégico com legendas animadas', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('1U1esK-iRo6M7Du5rNua8-ueld6B8i_0X') },

  // CHURRASCO
  { title: 'Melhor Kit Churrasco', category: 'Churrasco', description: 'Vídeo comercial dinâmico para sorteios e promoções', tools: 'Premiere Pro', duration: '0:25', driveLink: driveLink('1jDUNh_X3LjGyZhbJ2pJbVi6UsmrNQui7') },
  { title: 'Dica: Chama na Carne', category: 'Churrasco', description: 'Dica rápida com cortes de alta retenção', tools: 'Premiere Pro', duration: '0:20', driveLink: driveLink('17zA6AipB13jIu24V5D58tQ30tY_oqZFW') },
  { title: 'Corte de Carne Suculenta', category: 'Churrasco', description: 'Vídeo sensorial de gastronomia com sound design refinado', tools: 'Premiere Pro', duration: '0:18', driveLink: driveLink('1zvtpHi3df6n8cHTmfHK3IBepG-prGUSt') },

  // CLÍNICA
  { title: 'Reels Laser Day', category: 'Clinica', description: 'Edição moderna para divulgação de procedimentos', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('1nSulEuezZXsEkHVS3ZIodUCVEakbrdEK') },
  { title: 'Clínica 01', category: 'Clinica', description: 'Conteúdo médico com autoridade e retenção', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1ykjx2Li4U3brYgpEePXjBp7lDXER_9qX') },
  { title: 'Clínica 02', category: 'Clinica', description: 'Vídeo explicativo com animações e b-rolls', tools: 'Premiere Pro', duration: '0:50', driveLink: driveLink('15waL5x-G-yMZh6IFJhICDs0ehQUISxx8') },
  { title: 'Clínica 03', category: 'Clinica', description: 'Vídeo informativo sobre cuidados e saúde', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('1atVUY-AZQ1svZpMhRTBdJLQ3wfB-CvDs') },
  { title: 'Voz Clonada + Inserts', category: 'Clinica', description: 'Edição inovadora combinando IA de áudio e inserts visuais', tools: 'Premiere Pro / After Effects', duration: '0:42', driveLink: driveLink('1zIhcUDwDTJXO2GgEUQ5L9QQtEGU5qwWA') },
  { title: 'Tela Dividida Dinâmica', category: 'Clinica', description: 'Split screen dinâmico para comparação e impacto visual', tools: 'Premiere Pro', duration: '0:28', driveLink: driveLink('1Z2pkk89AkoLODvs3PI85S6qqJedSST8s') },

  // CORTES PODCAST
  { title: 'Jovens e Exercício', category: 'Podcast', description: 'Corte de podcast com legendas atrativas e zoom dinâmico', tools: 'Premiere Pro', duration: '0:58', driveLink: driveLink('1fzonmxYAihatTeZtQpC5rxLSWorDIWL7') },
  { title: 'Apito de Mestre', category: 'Podcast', description: 'Corte esportivo de alta energia e storytelling', tools: 'Premiere Pro', duration: '1:02', driveLink: driveLink('1KA6ES-8HGqyBy-IPM6U3ENRtCbw4GxeG') },
  { title: 'Lesão no Ombro: Sinais Iniciais', category: 'Podcast', description: 'Corte de saúde com foco em retenção e valor prático', tools: 'Premiere Pro', duration: '1:15', driveLink: driveLink('1kShpEWMXLzHXuhqsDH9B-norp52gL29-') },

  // EDUCAÇÃO
  { title: 'MundoMaker Institucional', category: 'Educacao', description: 'Vídeo institucional com foco em aprendizado e inovação', tools: 'Premiere Pro', duration: '1:05', driveLink: driveLink('1q-GIprP5DMA3uJ9jIg4K3Xht9irQsWXI') },
  { title: 'Caixa de Perguntas', category: 'Educacao', description: 'Vídeo interativo de resposta a dúvidas com efeitos gráficos', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1IYJ6ejNZGZx4jN3wrtZJngFUjOfwD6pf') },
  { title: 'Trend Transformação', category: 'Educacao', description: 'Edição de trend viral com ritmo acelerado', tools: 'CapCut / Premiere', duration: '0:12', driveLink: driveLink('1Q2Ye63OXJjT0_tb5W0mzsc-x72xh_1eJ') },
  { title: 'Aproveite as Férias', category: 'Educacao', description: 'Comercial sazonal com trilha envolvente', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('14Xw8fBApj66j0yiDSRclhstTO5NAyVZX') },
  { title: 'Oficina de Férias (Tráfego)', category: 'Educacao', description: 'Vídeo focado em conversão para campanhas pagas', tools: 'Premiere Pro', duration: '0:25', driveLink: driveLink('1tdRk0XD8VEN25uXKrUOEAmIMxJjnexyP') },
  { title: 'Educação 01', category: 'Educacao', description: 'Demonstração de aula e metodologia maker', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('11ID-xUf7LHMT9FbcPjP7fpm2Nz-Yx1Bq') },
  { title: 'Educação 02', category: 'Educacao', description: 'Edição focada em projetos práticos de alunos', tools: 'Premiere Pro', duration: '0:40', driveLink: driveLink('1SI-easLwnmMP670Zf0_O_iLt5GOhZeux') },
  { title: 'Evento Maker', category: 'Educacao', description: 'Cobertura dinâmica de evento educativo', tools: 'Premiere Pro', duration: '0:50', driveLink: driveLink('1wuSnpriZXEYfFAwWGa02PIaDSVw7m3BS') },
  { title: 'Educação 03', category: 'Educacao', description: 'Edição de reels rápido para redes sociais', tools: 'CapCut', duration: '0:22', driveLink: driveLink('1ozEugqfSvhnbqWMNqHs7qrMSw2BcFSF0') },
  { title: 'Showcase de Caixinhas', category: 'Educacao', description: 'Edição rítmica apresentando materiais educativos', tools: 'Premiere Pro', duration: '0:33', driveLink: driveLink('1inTJrRJtRxwcEwAKC8ZNIIauSwJxxp0-') },
  { title: 'Trend Cabeça Abre', category: 'Educacao', description: 'Efeito visual criativo com After Effects', tools: 'After Effects', duration: '0:07', driveLink: driveLink('1i4gjl8t4gZ9FXF1R5AChniADwdX1jmuO') },
  { title: 'Vídeo Comemorativo MundoMaker', category: 'Educacao', description: 'Edição emocionante de celebração e marcos', tools: 'Premiere Pro', duration: '1:10', driveLink: driveLink('1a5hZzB1pdLBsiGQAqHYs-YqSBNEz3Y4z') },

  // ESTÉTICA
  { title: 'Estética Lo-Fi', category: 'Estetica', description: 'Estilo cinematográfico suave com estética moderna', tools: 'Premiere Pro', duration: '0:38', driveLink: driveLink('1rg6zMYHozSTzvBbNLTlz_wMao8DjHok6') },
  { title: 'Estética 01', category: 'Estetica', description: 'Apresentação de resultados e atendimento', tools: 'Premiere Pro', duration: '0:32', driveLink: driveLink('13Ct4l9BkgU7D5Flsbb2Kj3MqnScIcYUB') },
  { title: 'Estética 02', category: 'Estetica', description: 'Vídeo focado em procedimentos estéticos', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1wsXJilKSr3jQYFgWJXFWCWh7p-tz6jRJ') },

  // EXPERT'S
  { title: 'Espanhol Expert 01', category: 'Experts', description: 'Conteúdo educativo dinâmico com inserções gráficas', tools: 'Premiere Pro', duration: '0:39', driveLink: driveLink('1Dwv720eThnyBm9MJ2Sv20jejGVsM7a9O') },
  { title: 'Espanhol Expert 02', category: 'Experts', description: 'Aula editada com alto índice de retenção visual', tools: 'Premiere Pro', duration: '0:48', driveLink: driveLink('1N0l94gyzscH3JH4u1l6hIjE4kZwqivpV') },
  { title: 'J. Influencer Vlog', category: 'Experts', description: 'Vlog / Storytelling com ritmo autêntico', tools: 'Premiere Pro', duration: '1:10', driveLink: driveLink('1w5eQOHQvM1dcY02uzq7iLehMeS0UcAFB') },
  { title: 'CNPJ Forte x CPF Fraco', category: 'Experts', description: 'Conteúdo de finanças e negócios com cortes incisivos', tools: 'Premiere Pro', duration: '0:55', driveLink: driveLink('1d_r4EWsxyRfc7aYcgxFEjwTKSO-KSfBW') },
  { title: 'Se Você Não Fizer', category: 'Experts', description: 'Vídeo motivacional e estratégico para infoprodutor', tools: 'Premiere Pro', duration: '0:42', driveLink: driveLink('1sUNtznS0lMUg6gE8dCdBN0h89GNj3Fsn') },

  // GRÁFICA
  { title: 'Gráfica Hawaii 01', category: 'Grafica', description: 'Apresentação de processos de impressão e acabamentos', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('1-0WHu2NBLzzA-bL33qFjyAnhyRFTrbT8') },
  { title: 'Gráfica Hawaii 02', category: 'Grafica', description: 'Showcase de materiais gráficos de alto padrão', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('1JZqZshE4sZBJ74phMishZd4ME6snvPD1') },
  { title: 'Gráfica Hawaii 03', category: 'Grafica', description: 'Edição comercial para captação de clientes', tools: 'Premiere Pro', duration: '0:28', driveLink: driveLink('1Ryy3_zSy9hJBbYMgVDx06yHaYjjHBL5x') },
  { title: 'Dia da Indústria Gráfica', category: 'Grafica', description: 'Vídeo institucional comemorativo e impactante', tools: 'Premiere Pro', duration: '0:48', driveLink: driveLink('1rLJnxYRJGJ1M53izFbHZr-M9GVqm-9Ta') },

  // IA
  { title: 'A Magia dos Avatares Virtuais', category: 'IA', description: 'Criação e edição de vídeo utilizando avatares e IA', tools: 'IA Generativa / Premiere', duration: '0:45', driveLink: driveLink('1yZ6r9WAb9SjkgyB4pq6TTN_bcDEHLE-r') },
  { title: 'IA 01', category: 'IA', description: 'Demonstração de ferramentas de inteligência artificial', tools: 'IA / Premiere Pro', duration: '0:35', driveLink: driveLink('1JVe7UOANUT7uGroNQSpCDLLkhxWOwU0E') },
  { title: 'IA 02', category: 'IA', description: 'Exemplo prático de workflow acelerado por IA', tools: 'IA / Premiere Pro', duration: '0:30', driveLink: driveLink('1XEZeqMLcf456hO3PB88_sGiyiRzc-LYh') },
  { title: 'IA 03', category: 'IA', description: 'Composição de áudio e imagem gerada por inteligência artificial', tools: 'IA / Premiere Pro', duration: '0:25', driveLink: driveLink('1da2Lu976gB5rkm-Pwe1wvIYi4teNLsWy') },

  // IMOBILIÁRIA
  { title: 'Apresentação de Imóvel Interativo', category: 'Imoveis', description: 'Tour guiado por imóvel com elementos visuais de checklist', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1WUYgPGkGQ5vMqNBtILUlELSZlLWk2Z_U') },
  { title: 'Trend Voo no Apartamento', category: 'Imoveis', description: 'Transição criativa com perspectiva aérea e dinamismo', tools: 'Premiere Pro', duration: '0:28', driveLink: driveLink('1R4GBPWUl9yMiJY80tGYwrw0Z70WVW7eH') },
  { title: 'Trend Fechamento de Venda', category: 'Imoveis', description: 'Trend cômica e persuasiva para corretores de imóveis', tools: 'Premiere Pro', duration: '0:20', driveLink: driveLink('1Xo1vPcMEjlTpkQsvveaJhHE2uR-he_2j') },
  { title: 'Vale a Pena Imóvel na Planta?', category: 'Imoveis', description: 'Conteúdo consultivo com autoridade para captação de leads', tools: 'Premiere Pro', duration: '0:55', driveLink: driveLink('1JX8oveD5pZYJHZThYwmpWEIrV0xgfcQn') },

  // MARKETING & MAKING OF
  { title: '3 Etapas para Audiência Forte', category: 'Marketing', description: 'Estratégia de conteúdo em formato de carrossel de vídeo', tools: 'Premiere Pro', duration: '0:50', driveLink: driveLink('1NZgoTVZg_WTfCo1Ca5m5ZGQ2ReRhBlVj') },
  { title: 'Benefícios de uma Marca Forte', category: 'Marketing', description: 'Vídeo institucional com storytelling de marca', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1e-_vCTC7NVoTym0y_lJWMPn-Eu7Gst4_') },
  { title: 'Marketing 01', category: 'Marketing', description: 'Behind the scenes / bastidores de produção audiovisual', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('11lKFqXgICcRlj_f_Lx-HSfRq9Wrs-M3f') },
  { title: 'Marketing 02', category: 'Marketing', description: 'Edição rápida para engajamento em agência de publicidade', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('1CgyrhMsgoIEFQI6RhL9Kd7aekMwKkSkC') },
  { title: 'Marketing 03', category: 'Marketing', description: 'Reels dinâmico de processo criativo', tools: 'Premiere Pro', duration: '0:25', driveLink: driveLink('1Tnv_joBlnCWkfHdOEizNR4qmf83BEMl3') },
  { title: 'Marketing 04', category: 'Marketing', description: 'Pílula de conteúdo para atração de novos clientes', tools: 'Premiere Pro', duration: '0:28', driveLink: driveLink('1Sd5jP5Pdj9hCVVyfrGxhdXErgjo1zZzl') },

  // MARMITAS
  { title: 'Marmita Ironberg 01', category: 'Marmitas', description: 'Comercial apetitoso com cortes sincronizados', tools: 'Premiere Pro', duration: '0:15', driveLink: driveLink('1jNm2SYoVWBNxfVayBot0sLJzepP6hR_f') },
  { title: 'Marmita Ironberg 02', category: 'Marmitas', description: 'Vídeo rápido de alta conversão para delivery', tools: 'Premiere Pro', duration: '0:12', driveLink: driveLink('1f5Zy52E76knj3Ksv6lzXQ4o-QYrVfSpW') },

  // PERSONAL TRAINER
  { title: 'Treino Personal Modelo', category: 'Personal', description: 'Edição fitness com ritmo enérgico e correções de cor', tools: 'Premiere Pro', duration: '0:40', driveLink: driveLink('1_JUZgli0xWlj88bgBnjKh33u7sddVpn9') },
  { title: '3 Exercícios para Glúteo', category: 'Personal', description: 'Vídeo técnico com dicas de postura e execução', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1ID7Y9Lkt-eYvEGi6kRp94FKjMobKzqPj') },
  { title: 'Treino de Panturrilha', category: 'Personal', description: 'Edição focada em biomecânica e instrução prática', tools: 'Premiere Pro', duration: '0:35', driveLink: driveLink('1Ov4o_hrsRuFbK4Wq-Igk4qD6DnfJIF_g') },

  // RESTAURANTE
  { title: 'Almoço Executivo', category: 'Restaurante', description: 'Comercial rápido e sensorial para horário de almoço', tools: 'Premiere Pro', duration: '0:09', driveLink: driveLink('1ltDdNPSHVZWG4bzcM5qK_PIXdaQq8Vz7') },
  { title: 'Happy Hour Drinks', category: 'Restaurante', description: 'Vídeo sensorial de coquetelaria e drinks', tools: 'Premiere Pro', duration: '0:11', driveLink: driveLink('1uY8FsC8tHUk_dtfyVhacKFzqa2ZqPQo2') },
  { title: 'Experiência Gastronômica', category: 'Restaurante', description: 'Edição rítmica focada na experiência do cliente', tools: 'Premiere Pro', duration: '0:16', driveLink: driveLink('17rlElqw-6R5hgpigwLCqlC59GJYq0ew_') },
  { title: 'Trend Drink Reverso', category: 'Restaurante', description: 'Efeito reverso criativo com alto impacto visual', tools: 'Premiere Pro', duration: '0:12', driveLink: driveLink('1qETPZytmd5QgTskM0PxtjXoZ-fdiYcJQ') },

  // OUTROS
  { title: 'Documentário Cantiga de Roda', category: 'Outros', description: 'Edição de longa duração com valor histórico e cultural', tools: 'Premiere Pro', duration: '35:00', driveLink: driveLink('17UUJARKCGGwn-SKz1cIhhKB1IH4nBN6X') },
  { title: 'Atividades Dinossauros', category: 'Outros', description: 'Edição lúdica e infantil com animações', tools: 'Premiere Pro', duration: '0:13', driveLink: driveLink('1bjSDjjzL5_n85cWaVMPO2U30cwq56djG') },
  { title: 'Elementos Animados', category: 'Outros', description: 'Motion graphics e composição de elementos 2D/3D', tools: 'After Effects', duration: '0:58', driveLink: driveLink('1rB8d69km9j0azvBcRCrDBCHDFeqenP7k') },
  { title: 'Boneco Animado', category: 'Outros', description: 'Animação e rigging de personagem', tools: 'After Effects', duration: '0:49', driveLink: driveLink('1OYktpAmn16vvLZTg0L8TbCM3nIdylTLx') },
  { title: 'Apresentação Técnica AP-750', category: 'Outros', description: 'Vídeo técnico demonstrativo de produto', tools: 'Premiere Pro', duration: '0:45', driveLink: driveLink('1iF6lG4nrWafIfIBPZlxFAY5UlucLK9Jr') },
  { title: 'Live Completa 14/07', category: 'Outros', description: 'Gravação e edição de transmissão ao vivo', tools: 'Premiere Pro', duration: '1:00', driveLink: driveLink('16-ZHGntDwswQHmdtAm6DF-UE4xpPNb5X') },
  { title: 'Outros 01', category: 'Outros', description: 'Criação de conteúdo diverso para redes', tools: 'Premiere Pro', duration: '0:30', driveLink: driveLink('1rp_aRc7t3Et8WuZjL73QwaRFywifPVCy') }
];

const output = '/**\n * DATA.JS - Arquivo de configuração dos vídeos\n * Gerado automaticamente com IDs reais do Google Drive\n */\n\nexport const videos = ' + JSON.stringify(videos, null, 4) + ';\n';
fs.writeFileSync('./js/data.js', output);
console.log('Wrote ' + videos.length + ' videos to data.js');
