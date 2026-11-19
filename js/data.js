/* Portfolio content, FR + EN.
   Rule: every number here comes from the README / results of the linked repository.
   Work in progress shows only what is already measured. */

window.PROFILE = {
  name: "Mohamed Amine BELKACEM",
  github: "https://github.com/amine-belkacem",
  linkedin: "https://www.linkedin.com/in/mohamed-amine-belkacem-262582391/",
  email: "mohamed-amine.belkacem8@etu.univ-lorraine.fr",
  role: {
    en: "Embedded systems, FPGA and embedded AI",
    fr: "Systèmes embarqués, FPGA et IA embarquée",
  },
  school: {
    en: "M2 student, Communicating Electronic Systems Design (CSEC), University of Lorraine, Metz",
    fr: "Étudiant en M2 Conception de systèmes électroniques communicants (CSEC), Université de Lorraine, Metz",
  },
  pitch: {
    en: "I work where hardware meets software: VHDL on FPGA, analog front ends in SPICE, C down to the SIMD register, and the AI models that have to run on all of it. I treat every project as a measurement: a spec written before the first run, tests that are proven to fail when the code is broken, and numbers with their confidence intervals.",
    fr: "Je travaille là où le matériel rencontre le logiciel : VHDL sur FPGA, étages analogiques en SPICE, C jusqu'au registre SIMD, et les modèles d'IA qui doivent tourner sur tout ça. Je traite chaque projet comme une mesure : un cahier des charges écrit avant le premier essai, des tests dont je vérifie qu'ils échouent quand on casse le code, et des chiffres avec leurs intervalles de confiance.",
  },
  seeking: {
    en: "Looking for a 4 to 6-month end-of-studies internship from March 2027, in France or Luxembourg.",
    fr: "Je cherche un stage de fin d'études de 4 à 6 mois à partir de mars 2027, en France ou au Luxembourg.",
  },
  languages: {
    en: "French · English · Arabic · Kabyle · Spanish",
    fr: "Français · Anglais · Arabe · Kabyle · Espagnol",
  },
};

window.DOMAINS = [
  { id: "ai", en: "AI & machine learning", fr: "IA & apprentissage" },
  { id: "edge", en: "Embedded AI", fr: "IA embarquée" },
  { id: "fpga", en: "FPGA & digital design", fr: "FPGA & numérique" },
  { id: "analog", en: "Analog & electronics", fr: "Analogique & électronique" },
  { id: "sec", en: "Security", fr: "Sécurité" },
  { id: "ind", en: "Industrial automation", fr: "Informatique industrielle" },
  { id: "iot", en: "Embedded & IoT", fr: "Embarqué & IoT" },
  { id: "sw", en: "Software & tools", fr: "Logiciel & outils" },
];

window.STATUS = {
  done: { en: "Complete", fr: "Terminé" },
  wip: { en: "In progress", fr: "En cours" },
  early: { en: "Just started", fr: "Démarré" },
};

const GH = "https://github.com/amine-belkacem/";

window.PROJECTS = [
  /* ---------------- Featured ---------------- */
  {
    id: "aes128-sidechannel-lab", featured: true, status: "wip", year: "2026",
    domains: ["sec", "fpga"],
    stage: { en: "Milestone 6 of 9", fr: "Jalon 6 sur 9" },
    title: { en: "AES-128 side-channel lab", fr: "Laboratoire canaux auxiliaires AES-128" },
    tagline: {
      en: "An AES-128 core in VHDL, broken by correlation power analysis on simulated traces, then protected and measured again, up to the glitches of the post-fit netlist.",
      fr: "Un cœur AES-128 en VHDL, cassé par analyse de corrélation (CPA) sur des traces simulées, puis protégé et remesuré, jusqu'aux glitches de la netlist après placement-routage.",
    },
    results: [
      { en: "Unprotected core: 4,890 LE, 105.7 ± 2.7 MHz on Cyclone IV; CPA recovers the full 128-bit key, TVLA flags leakage from 43 traces.", fr: "Cœur nu : 4 890 LE, 105,7 ± 2,7 MHz sur Cyclone IV ; la CPA retrouve la clé de 128 bits, la TVLA détecte la fuite dès 43 traces." },
      { en: "Same tooling breaks a real FPGA from public oscilloscope traces: full key in 373 traces.", fr: "Les mêmes outils cassent un vrai FPGA à partir de traces d'oscilloscope publiques : clé complète en 373 traces." },
      { en: "Random dummy rounds: 28× more traces for an unprofiled attacker, only 3.7× for a profiled one.", fr: "Tours factices aléatoires : 28× plus de traces pour un attaquant non profilé, seulement 3,7× pour un attaquant profilé." },
      { en: "Gate-level timing simulation of the netlist: 73 % of LUT toggles are glitches.", fr: "Simulation temporelle de la netlist : 73 % des transitions des LUT sont des glitches." },
    ],
    stack: ["VHDL", "GHDL", "Questa", "Quartus", "Python", "NumPy", "CPA / TVLA"],
  },
  {
    id: "autorange-current-profiler", featured: true, status: "wip", year: "2026",
    domains: ["analog", "iot"],
    stage: { en: "J7 of 10: Altium schematic", fr: "J7 sur 10 : schéma Altium" },
    title: { en: "Autorange current profiler (Pi 5 HAT)", fr: "Profileur de courant à gamme automatique (HAT Pi 5)" },
    tagline: {
      en: "A 1 µA to 500 mA current profiler that switches range in hardware without losing a sample. Designed and tested in ngspice first, then drawn in Altium, built last.",
      fr: "Un profileur de courant de 1 µA à 500 mA qui change de gamme en matériel sans perdre d'échantillon. Conçu et testé d'abord dans ngspice, puis dessiné dans Altium, fabriqué en dernier.",
    },
    results: [
      { en: "Four shunt ranges, every range under 4 % of the error limit before calibration; burden 61.95 mV at 500 mA.", fr: "Quatre gammes, chacune sous 4 % de la limite d'erreur avant calibration ; chute de tension 61,95 mV à 500 mA." },
      { en: "Range switching in 20 to 90 ns with comparators, latches and gate drivers (transient simulation).", fr: "Changement de gamme en 20 à 90 ns avec comparateurs, verrous et drivers de grille (simulation transitoire)." },
      { en: "Monte Carlo on 200 instruments, 0–50 °C: 100 % yield on the error spec.", fr: "Monte-Carlo sur 200 instruments, 0–50 °C : rendement de 100 % sur la spécification d'erreur." },
      { en: "Firmware core in C tested against the Python reference: 0 divergence on 5,660 samples. 105 tests in CI.", fr: "Cœur du firmware en C testé contre la référence Python : 0 écart sur 5 660 échantillons. 105 tests en CI." },
    ],
    note: { en: "Simulation only so far; the real board comes at the end.", fr: "Simulation uniquement pour l'instant ; la carte réelle vient à la fin." },
    stack: ["ngspice", "Altium Designer", "Python", "C", "RP2040", "Monte Carlo"],
  },
  {
    id: "int8-neon-inference-pi5", featured: true, status: "wip", year: "2026",
    domains: ["edge", "iot"],
    stage: { en: "J3: Pi 5 benchmarks next", fr: "J3 : mesures sur Pi 5 à venir" },
    title: { en: "Hand-written int8 inference engine (C / NEON)", fr: "Moteur d'inférence int8 écrit à la main (C / NEON)" },
    tagline: {
      en: "My own int8 inference engine in C for a EuroSAT CNN, then its hot loop rewritten with ARM NEON SDOT, measured on a Raspberry Pi 5 against PyTorch and ONNX Runtime. Rule: same bytes as the integer reference, layer by layer.",
      fr: "Mon propre moteur d'inférence int8 en C pour un CNN EuroSAT, puis sa boucle critique réécrite en ARM NEON SDOT, mesuré sur Raspberry Pi 5 face à PyTorch et ONNX Runtime. Règle : les mêmes octets que la référence entière, couche par couche.",
    },
    results: [
      { en: "Bit-exact: 89,100 / 89,100 op outputs identical to the reference over 4,050 test tiles (98.42 % accuracy).", fr: "Bit-exact : 89 100 / 89 100 sorties d'opérations identiques à la référence sur 4 050 tuiles (98,42 % de précision)." },
      { en: "Static 256 KB arena, no malloc at inference (checked by a test on the object files).", fr: "Arène statique de 256 Ko, aucun malloc pendant l'inférence (vérifié par un test sur les objets compilés)." },
      { en: "Found why ONNX Runtime drifts up to 50 LSB on AVX2: int16 pair saturation in VPMADDUBSW.", fr: "Trouvé pourquoi ONNX Runtime s'écarte jusqu'à 50 LSB sur AVX2 : saturation int16 des paires dans VPMADDUBSW." },
    ],
    stack: ["C11", "ARM NEON", "ONNX Runtime", "CMake", "QEMU", "ASan / UBSan"],
  },
  {
    id: "french-bpe-tokenizer", featured: true, status: "done", year: "2026",
    domains: ["ai", "edge"],
    stage: { en: "v1.0.1", fr: "v1.0.1" },
    title: { en: "French BPE tokenizer, from scratch to C", fr: "Tokenizer BPE français, du zéro au C" },
    tagline: {
      en: "A byte-level BPE tokenizer written from scratch, trained on French Wikipedia, compared with GPT-2, GPT-4, GPT-4o, Mistral and CamemBERT, and rewritten in C for a Raspberry Pi 5.",
      fr: "Un tokenizer BPE au niveau octet écrit de zéro, entraîné sur Wikipédia en français, comparé à GPT-2, GPT-4, GPT-4o, Mistral et CamemBERT, puis réécrit en C pour Raspberry Pi 5.",
    },
    results: [
      { en: "The same French text costs 27 % more tokens with GPT-4's tokenizer and 11 % more with GPT-4o's.", fr: "Le même texte français coûte 27 % de tokens en plus avec le tokenizer de GPT-4 et 11 % avec celui de GPT-4o." },
      { en: "A French-aware regex helps only a little: −2.45 % [−2.57, −2.33].", fr: "Une regex pensée pour le français n'aide que peu : −2,45 % [−2,57 ; −2,33]." },
      { en: "C encoder identical to Python on 2,340 documents; 14.4 MB/s on the Pi, 8.5 MB peak memory.", fr: "Encodeur C identique au Python sur 2 340 documents ; 14,4 Mo/s sur le Pi, 8,5 Mo de mémoire pic." },
    ],
    stack: ["Python", "C99", "tiktoken", "SentencePiece", "pytest", "ASan / UBSan"],
  },
  {
    id: "fraud-detection-alert-budget", featured: true, status: "done", year: "2026",
    domains: ["ai"],
    stage: { en: "v1.0.0", fr: "v1.0.0" },
    title: { en: "Fraud detection under an alert budget", fr: "Détection de fraude sous budget d'alertes" },
    tagline: {
      en: "Credit card fraud at 0.17 % prevalence, evaluated the way a fraud team uses a model: temporal split, fixed alert budget, cost in euros and bootstrap intervals.",
      fr: "Fraude à la carte bancaire à 0,17 %, évaluée comme une équipe anti-fraude utilise un modèle : découpage temporel, budget d'alertes fixe, coût en euros et intervalles bootstrap.",
    },
    results: [
      { en: "XGBoost catches 80 % [71, 88] of frauds at a 0.1 % false positive rate; PR-AUC 0.796.", fr: "XGBoost attrape 80 % [71 ; 88] des fraudes à 0,1 % de faux positifs ; PR-AUC 0,796." },
      { en: "SMOTE and undersampling: no measurable gain, intervals centred on zero.", fr: "SMOTE et sous-échantillonnage : aucun gain mesurable, intervalles centrés sur zéro." },
      { en: "A random split would have overstated PR-AUC by 0.07. All 6 pre-set success criteria met.", fr: "Un découpage aléatoire aurait surestimé la PR-AUC de 0,07. Les 6 critères fixés d'avance sont atteints." },
    ],
    stack: ["Python", "scikit-learn", "XGBoost", "imbalanced-learn", "pytest"],
  },
  {
    id: "audio-deepfake-generalization", featured: true, status: "wip", year: "2026",
    domains: ["ai", "sec"],
    stage: { en: "Milestone 5 done", fr: "Jalon 5 terminé" },
    title: { en: "Audio deepfake detection that generalises", fr: "Détection de deepfakes audio qui généralise" },
    tagline: {
      en: "LFCC features against a frozen wav2vec 2.0 on ASVspoof 2019, then the hard part: unseen generators, real deepfakes found online, the silence shortcut, and telephone channels.",
      fr: "Descripteurs LFCC contre un wav2vec 2.0 figé sur ASVspoof 2019, puis le plus dur : générateurs inconnus, vrais deepfakes trouvés en ligne, raccourci du silence et canaux téléphoniques.",
    },
    results: [
      { en: "wav2vec 2.0 layer 3 + linear probe: 1.21 % EER, against 10.48 % for LFCC + GMM.", fr: "wav2vec 2.0 couche 3 + sonde linéaire : 1,21 % d'EER, contre 10,48 % pour LFCC + GMM." },
      { en: "Silence length alone gives 19.6 % EER; without it, a more honest figure is about 8 %.", fr: "La seule durée du silence donne 19,6 % d'EER ; sans lui, un chiffre plus honnête est d'environ 8 %." },
      { en: "On real-world deepfakes (In-the-Wild) the best system rises to 22.4 %; through 10 simulated phone channels it averages 12 %.", fr: "Sur de vrais deepfakes (In-the-Wild), le meilleur système monte à 22,4 % ; à travers 10 canaux téléphoniques simulés, 12 % en moyenne." },
    ],
    stack: ["PyTorch", "wav2vec 2.0", "scikit-learn", "G.711 / Opus", "Kaggle GPU"],
  },

  /* ---------------- AI ---------------- */
  {
    id: "eurosat-onboard-transfer", status: "wip", year: "2026",
    domains: ["ai", "edge"],
    stage: { en: "Milestone 2 of 6", fr: "Jalon 2 sur 6" },
    title: { en: "EuroSAT: transfer learning for onboard triage", fr: "EuroSAT : transfert d'apprentissage pour le tri à bord" },
    tagline: {
      en: "Scratch CNN vs ResNet-50 vs ViT-S/16, linear probe vs fine-tuning, on Sentinel-2 tiles with 1 % to 100 % of the labels.",
      fr: "CNN de zéro vs ResNet-50 vs ViT-S/16, sonde linéaire vs fine-tuning, sur des tuiles Sentinel-2 avec 1 % à 100 % des étiquettes.",
    },
    results: [
      { en: "75 training runs (5 configs × 5 data fractions × 3 seeds).", fr: "75 entraînements (5 configurations × 5 fractions × 3 graines)." },
      { en: "With 191 labels: fine-tuned ViT 92.8 % vs scratch CNN 77.5 %. With all 18,900 the CNN catches up (98.63 %).", fr: "Avec 191 étiquettes : ViT fine-tuné 92,8 % vs CNN de zéro 77,5 %. Avec les 18 900, le CNN rattrape (98,63 %)." },
      { en: "A ViT linear probe trained in 6 s matches a fine-tuned ResNet-50 at 1 %.", fr: "Une sonde linéaire ViT entraînée en 6 s égale un ResNet-50 fine-tuné à 1 %." },
    ],
    stack: ["PyTorch", "timm", "Kaggle T4", "pytest"],
  },
  {
    id: "spam-classic-vs-transformer-edge", status: "wip", year: "2026",
    domains: ["ai", "edge"],
    stage: { en: "Milestone 1 of 6 (PC)", fr: "Jalon 1 sur 6 (PC)" },
    title: { en: "Spam filtering: classic model vs Transformer", fr: "Filtrage de spam : modèle classique vs Transformer" },
    tagline: {
      en: "When is TF-IDF + logistic regression enough, and when is DistilBERT worth its cost? Measured from a PC down to a Raspberry Pi 5.",
      fr: "Quand TF-IDF + régression logistique suffit-il, et quand DistilBERT vaut-il son coût ? Mesuré du PC jusqu'au Raspberry Pi 5.",
    },
    results: [
      { en: "Statistically tied on F1 (0.942 vs 0.954, difference interval contains 0).", fr: "À égalité statistique en F1 (0,942 vs 0,954, l'intervalle de la différence contient 0)." },
      { en: "DistilBERT is about 26× slower per message and 137× larger on disk.", fr: "DistilBERT est environ 26× plus lent par message et 137× plus lourd sur disque." },
      { en: "Duplicates removed before splitting (5,574 lines → 5,159 messages) so the test set does not reward memory.", fr: "Doublons retirés avant le découpage (5 574 lignes → 5 159 messages) pour que le test ne récompense pas la mémoire." },
    ],
    stack: ["scikit-learn", "Hugging Face", "DistilBERT", "PyTorch"],
  },
  {
    id: "lunarlander-dqn-vs-ppo", status: "wip", year: "2026",
    domains: ["ai"],
    stage: { en: "v0.1, 3 seeds", fr: "v0.1, 3 graines" },
    title: { en: "DQN vs PPO on LunarLander", fr: "DQN vs PPO sur LunarLander" },
    tagline: {
      en: "Reinforcement learning treated as a measurement problem: same budget, several seeds, held-out evaluation episodes.",
      fr: "L'apprentissage par renforcement traité comme un problème de mesure : même budget, plusieurs graines, épisodes d'évaluation réservés.",
    },
    results: [
      { en: "DQN reaches the 200 threshold 3 to 4 times sooner, then all three runs collapse below a random agent.", fr: "DQN atteint le seuil de 200 3 à 4 fois plus tôt, puis les trois runs s'effondrent sous un agent aléatoire." },
      { en: "PPO: 100 % success on 100 held-out episodes for every seed, 16 min vs 112 min of training.", fr: "PPO : 100 % de réussite sur 100 épisodes réservés pour chaque graine, 16 min contre 112 min d'entraînement." },
    ],
    stack: ["Gymnasium", "PyTorch", "DQN", "PPO"],
  },
  {
    id: "optimizers-low-precision", status: "wip", year: "2026",
    domains: ["ai", "fpga"],
    stage: { en: "J4 of 5", fr: "J4 sur 5" },
    title: { en: "Optimizers in low precision", fr: "Optimiseurs en basse précision" },
    tagline: {
      en: "SGD, Momentum, Adam and AdamW written from scratch in NumPy, checked against torch.optim, then trained in fp16, bf16 and fixed point.",
      fr: "SGD, Momentum, Adam et AdamW écrits de zéro en NumPy, vérifiés contre torch.optim, puis entraînés en fp16, bf16 et virgule fixe.",
    },
    results: [
      { en: "600 training runs, 6 number formats, 3 precision policies.", fr: "600 entraînements, 6 formats numériques, 3 politiques de précision." },
      { en: "Adam fails in every run with fp16 or fixed-point state: eps = 1e-8 rounds to 0. An fp32 state fixes it.", fr: "Adam échoue à chaque run avec un état fp16 ou virgule fixe : eps = 1e-8 s'arrondit à 0. Un état fp32 règle le problème." },
      { en: "AdamW's weight decay vanishes in every 16-bit format: 1 − lr·wd rounds to 1.", fr: "La décroissance de poids d'AdamW disparaît dans tous les formats 16 bits : 1 − lr·wd s'arrondit à 1." },
    ],
    stack: ["NumPy", "PyTorch", "pytest"],
  },
  {
    id: "dp-federated-hospitals", status: "early", year: "2026",
    domains: ["ai", "sec"],
    stage: { en: "J0: feasibility", fr: "J0 : faisabilité" },
    title: { en: "Federated learning with differential privacy", fr: "Apprentissage fédéré avec confidentialité différentielle" },
    tagline: {
      en: "20 simulated hospitals train one blood-cell classifier without sharing images. Who pays the cost of privacy, hospital by hospital?",
      fr: "20 hôpitaux simulés entraînent un classifieur de cellules sanguines sans partager leurs images. Qui paie le coût de la confidentialité, hôpital par hôpital ?",
    },
    results: [
      { en: "Feasibility measured: DP-SGD epoch 1.344 s vs 0.560 s for plain SGD (2.4×), on a laptop CPU.", fr: "Faisabilité mesurée : époque DP-SGD 1,344 s contre 0,560 s en SGD simple (2,4×), sur CPU portable." },
      { en: "No accuracy results yet.", fr: "Pas encore de résultat de précision." },
    ],
    stack: ["Flower", "Opacus", "PyTorch", "MedMNIST"],
  },

  /* ---------------- Embedded AI / LLM ---------------- */
  {
    id: "llm-below-2-bits-pi5", status: "early", year: "2026",
    domains: ["edge", "ai"],
    stage: { en: "J0: method and tooling", fr: "J0 : méthode et outillage" },
    title: { en: "What breaks first below 2 bits? LLMs on a Pi 5", fr: "Qu'est-ce qui casse en premier sous 2 bits ? LLM sur Pi 5" },
    tagline: {
      en: "Qwen3 0.6B to 8B at 8 quantization levels down to one sign bit per weight, plus ternary BitNet: which capability goes first (arithmetic, reasoning, knowledge or French) and is the speed worth it?",
      fr: "Qwen3 de 0,6 à 8 milliards de paramètres à 8 niveaux de quantification jusqu'à un bit de signe par poids, plus BitNet ternaire : quelle capacité lâche en premier (calcul, raisonnement, connaissances ou français), et la vitesse en vaut-elle la peine ?",
    },
    results: [
      { en: "Method frozen before the first run: paired McNemar + Holm, bootstrap, \"broken\" = retention upper bound below 90 %.", fr: "Méthode figée avant le premier essai : McNemar apparié + Holm, bootstrap, « cassé » = borne haute de rétention sous 90 %." },
      { en: "84 tests; no model evaluated yet.", fr: "84 tests ; aucun modèle évalué pour l'instant." },
    ],
    stack: ["llama.cpp", "GGUF", "Python", "Raspberry Pi 5"],
  },
  {
    id: "pi5-llm-quant-map", status: "early", year: "2026",
    domains: ["edge"],
    stage: { en: "J0: tooling", fr: "J0 : outillage" },
    title: { en: "What quantization costs a small LLM on a Pi 5", fr: "Ce que coûte la quantification d'un petit LLM sur Pi 5" },
    tagline: {
      en: "Tokens per second, real memory, perplexity, accuracy on a technical quiz and thermal throttling, from 2 to 8 bits with llama.cpp on a 16 GB Raspberry Pi 5.",
      fr: "Tokens par seconde, mémoire réelle, perplexité, précision sur un QCM technique et throttling thermique, de 2 à 8 bits avec llama.cpp sur un Raspberry Pi 5 de 16 Go.",
    },
    results: [
      { en: "Tooling and tests in place (Wilson intervals, KV-cache memory model, bandwidth ceiling); no results published yet.", fr: "Outils et tests en place (intervalles de Wilson, modèle mémoire du cache KV, plafond de bande passante) ; aucun résultat publié pour l'instant." },
    ],
    stack: ["llama.cpp", "Python", "shellcheck", "Raspberry Pi 5"],
  },

  /* ---------------- FPGA / analog IC ---------------- */
  {
    id: "md-fpga-codesign", repo: null, status: "wip", year: "2026–2027",
    domains: ["fpga"],
    stage: { en: "Step 2: fixed-point bonded forces", fr: "Étape 2 : forces liées en virgule fixe" },
    title: { en: "Molecular dynamics on FPGA (HW/SW co-design)", fr: "Dynamique moléculaire sur FPGA (co-conception HW/SW)" },
    tagline: {
      en: "M2 project: bonded forces and the reciprocal PME chain (charge spreading, 3D FFT, inverse FFT, interpolation) in portable VHDL, against an OpenMM reference.",
      fr: "Projet de M2 : forces liées et chaîne PME réciproque (étalement des charges, FFT 3D, FFT inverse, interpolation) en VHDL portable, comparées à une référence OpenMM.",
    },
    results: [
      { en: "Python reference model matches OpenMM to 1e-13, PME included.", fr: "Modèle de référence Python identique à OpenMM à 1e-13, PME comprise." },
      { en: "Bit-exact fixed-point model of the bond forces, 536 test vectors; formats chosen from measured error (Q8.24 positions, Q16.48 forces).", fr: "Modèle virgule fixe bit-exact des forces de liaison, 536 vecteurs de test ; formats choisis sur l'erreur mesurée (positions Q8.24, forces Q16.48)." },
      { en: "Found issues in the spec: Q8.24 cannot hold k_b, Q16.48 saturates for Δr > 0.0708 nm.", fr: "Problèmes relevés dans le cahier des charges : Q8.24 ne contient pas k_b, Q16.48 sature pour Δr > 0,0708 nm." },
    ],
    note: { en: "Repository published once the course project is graded.", fr: "Dépôt publié après l'évaluation du projet." },
    stack: ["VHDL", "Python", "OpenMM", "Quartus", "Questa"],
  },
  {
    id: "fp8-mac-vhdl", status: "done", year: "2026",
    domains: ["fpga", "edge"],
    stage: { en: "M1 project", fr: "Projet de M1" },
    title: { en: "FP8 multiply-accumulate unit in VHDL", fr: "Unité MAC FP8 en VHDL" },
    tagline: {
      en: "A multiply-accumulate operator in FP8 E4M3 for AI inference, built block by block, synthesized on Cyclone IV and verified with self-checking testbenches.",
      fr: "Un opérateur multiplication-accumulation en FP8 E4M3 pour l'inférence IA, construit bloc par bloc, synthétisé sur Cyclone IV et vérifié par des testbenches auto-vérifiants.",
    },
    results: [
      { en: "Full MAC in 360 logic elements, about 6 % of an EP4CE6.", fr: "MAC complet en 360 éléments logiques, environ 6 % d'un EP4CE6." },
      { en: "Saturation to ±448, flush to zero; testbenches run with GHDL in CI on every push.", fr: "Saturation à ±448, mise à zéro en cas de sous-dépassement ; testbenches exécutés par GHDL en CI à chaque push." },
    ],
    stack: ["VHDL", "Quartus Prime", "Questa", "GHDL"],
  },
  {
    id: "sky130-opamp-sizing-bench", status: "early", year: "2026",
    domains: ["analog", "ai"],
    stage: { en: "J0 of 7", fr: "J0 sur 7" },
    title: { en: "Can an optimiser size an op-amp better than me?", fr: "Un optimiseur dimensionne-t-il un ampli op mieux que moi ?" },
    tagline: {
      en: "Random search, Bayesian optimisation and CMA-ES sizing a two-stage Miller op-amp on SkyWater 130 nm, at an equal number of ngspice simulations, then checked at corners and in Monte Carlo against a gm/Id hand design.",
      fr: "Recherche aléatoire, optimisation bayésienne et CMA-ES dimensionnent un ampli op Miller deux étages en SkyWater 130 nm, à nombre égal de simulations ngspice, puis vérifiés aux coins et en Monte-Carlo face à un dimensionnement à la main en gm/Id.",
    },
    results: [
      { en: "Reduced PDK library identical to the full one to the 12th digit: 0.18 s per simulation instead of 9.3 s of loading.", fr: "Bibliothèque PDK réduite identique à la complète à la 12e décimale : 0,18 s par simulation au lieu de 9,3 s de chargement." },
      { en: "Mismatch spread within 2.2 % of my prediction over 1,000 draws. Hypotheses frozen before any optimisation.", fr: "Dispersion de mismatch à 2,2 % de ma prédiction sur 1 000 tirages. Hypothèses figées avant toute optimisation." },
    ],
    stack: ["ngspice", "SKY130 PDK", "Python", "Monte Carlo"],
  },
  {
    id: "analog-imc-error-budget", status: "early", year: "2026",
    domains: ["analog", "edge"],
    stage: { en: "J0: foundations", fr: "J0 : fondations" },
    title: { en: "Analog in-memory computing: an error budget", fr: "Calcul analogique en mémoire : un budget d'erreur" },
    tagline: {
      en: "A resistive crossbar simulator to find which non-ideality costs a EuroSAT CNN the most accuracy, and the device and ADC specs that keep the loss under one point.",
      fr: "Un simulateur de crossbar résistif pour trouver quelle non-idéalité coûte le plus de précision à un CNN EuroSAT, et les specs de composant et d'ADC qui gardent la perte sous un point.",
    },
    results: [
      { en: "Differential weight mapping, DAC/ADC models and energy blocks; 45 hand-checked tests. No accuracy claim yet.", fr: "Mapping différentiel des poids, modèles DAC/ADC et briques d'énergie ; 45 tests vérifiés à la main. Pas encore de résultat de précision." },
    ],
    stack: ["Python", "NumPy", "SciPy", "ngspice"],
  },
  {
    id: "qt6-uart-fpga-api", status: "done", year: "2025–2026",
    domains: ["sw", "fpga"],
    stage: { en: "M1 project", fr: "Projet de M1" },
    title: { en: "Qt6 UART API, PC ↔ FPGA", fr: "API UART Qt6, PC ↔ FPGA" },
    tagline: {
      en: "A C++/Qt6 class that handles the serial link between a PC and a Basys 3 board, tested on the real board, with raw and hex debug logs.",
      fr: "Une classe C++/Qt6 qui gère la liaison série entre un PC et une carte Basys 3, testée sur la vraie carte, avec journaux bruts et hexadécimaux.",
    },
    results: [
      { en: "QTest tests run in CI on virtual serial ports.", fr: "Tests QTest exécutés en CI sur des ports série virtuels." },
      { en: "My part of a project under NDA, published with my supervisor's agreement.", fr: "Ma partie d'un projet sous accord de confidentialité, publiée avec l'accord de mon encadrant." },
    ],
    stack: ["C++17", "Qt 6", "QSerialPort", "CMake", "Basys 3"],
  },

  /* ---------------- Industrial ---------------- */
  {
    id: "softplc-pi5-determinism", status: "early", year: "2026",
    domains: ["ind", "iot"],
    stage: { en: "J0: bench bring-up", fr: "J0 : mise en route du banc" },
    title: { en: "Is a soft-PLC on a Pi 5 deterministic enough?", fr: "Un automate logiciel sur Pi 5 est-il assez déterministe ?" },
    tagline: {
      en: "A virtual bottling line in Python driven over Modbus TCP by OpenPLC Runtime v4 on a Raspberry Pi 5, supervised through OPC UA. Scan-cycle jitter measured at three levels, standard kernel vs PREEMPT_RT.",
      fr: "Une ligne d'embouteillage virtuelle en Python pilotée en Modbus TCP par OpenPLC Runtime v4 sur Raspberry Pi 5, supervisée en OPC UA. Gigue du cycle mesurée à trois niveaux, noyau standard vs PREEMPT_RT.",
    },
    results: [
      { en: "Plant physics, buffer tank with a PI level loop, IEC 61131-3 ST programs with unit tests; 68 tests in CI.", fr: "Physique du procédé, cuve tampon avec régulation PI de niveau, programmes ST IEC 61131-3 avec tests unitaires ; 68 tests en CI." },
      { en: "No jitter results yet; success criterion fixed in advance (max jitter ≤ 10 % of the 10 ms cycle over 1 h under load).", fr: "Pas encore de mesure de gigue ; critère fixé d'avance (gigue max ≤ 10 % du cycle de 10 ms sur 1 h en charge)." },
    ],
    stack: ["OpenPLC", "Structured Text", "Modbus TCP", "OPC UA", "PREEMPT_RT", "Python"],
  },
  {
    id: "plc-drift-twin", status: "early", year: "2026",
    domains: ["ind", "ai"],
    stage: { en: "J1: data generator", fr: "J1 : générateur de données" },
    title: { en: "Digital twin and drift detection next to a soft-PLC", fr: "Jumeau numérique et détection de dérive à côté d'un automate" },
    tagline: {
      en: "Catch a slowly drifting cylinder or sensor before it fails, name the part and estimate the cycles left, on the same Pi 5 that runs the PLC. Shewhart, CUSUM, Isolation Forest and an autoencoder compared at the same false alarm rate.",
      fr: "Repérer un vérin ou un capteur qui dérive avant la panne, nommer la pièce et estimer les cycles restants, sur le même Pi 5 que l'automate. Shewhart, CUSUM, Isolation Forest et autoencodeur comparés à taux de fausses alarmes égal.",
    },
    results: [
      { en: "Seeded drift datasets and evaluation metrics (delay, Garwood and Clopper-Pearson intervals); 42 tests. Success criteria written before any measurement.", fr: "Jeux de dérive à graine et métriques d'évaluation (délai, intervalles de Garwood et Clopper-Pearson) ; 42 tests. Critères de réussite écrits avant toute mesure." },
    ],
    stack: ["Python", "NumPy", "scikit-learn", "OpenPLC"],
  },

  /* ---------------- IoT / embedded ---------------- */
  {
    id: "health-monitor-iot", status: "done", year: "2025",
    domains: ["iot"],
    stage: { en: "Master's thesis, USTHB", fr: "Mémoire de Master, USTHB" },
    title: { en: "Connected health monitor (ESP32 + Pi 5)", fr: "Moniteur de santé connecté (ESP32 + Pi 5)" },
    tagline: {
      en: "ECG, SpO2, temperature and air quality read by an ESP32 and sent over Wi-Fi to a Flask/SQLite server on a Raspberry Pi 5, with a live web dashboard and a Flutter app. Data never leaves the house.",
      fr: "ECG, SpO2, température et qualité de l'air lus par un ESP32 et envoyés en Wi-Fi à un serveur Flask/SQLite sur Raspberry Pi 5, avec tableau de bord web en direct et application Flutter. Les données ne quittent pas la maison.",
    },
    results: [
      { en: "Whole chain working on the real setup; readings every 3.07 s (median) against a 3 s timer.", fr: "Chaîne complète fonctionnelle sur le vrai montage ; mesures toutes les 3,07 s (médiane) pour un timer de 3 s." },
      { en: "Going back through the code, I found and fixed a bug that truncated the ECG to whole volts.", fr: "En relisant le code, j'ai trouvé et corrigé un bug qui tronquait l'ECG au volt entier." },
    ],
    stack: ["ESP32", "Arduino C++", "Flask", "SQLite", "Flutter", "Chart.js"],
  },
  {
    id: "home-assistant-weather-station", status: "done", year: "2025–2026",
    domains: ["iot", "sw"],
    stage: { en: "M1 lab, 10 students", fr: "TP de M1, 10 étudiants" },
    title: { en: "Connected weather station dashboard", fr: "Tableau de bord de station météo connectée" },
    tagline: {
      en: "A vanilla JavaScript dashboard reading ESP32 sensors through the Home Assistant REST API and comparing them with Open-Meteo, made reliable: no token in the code, timeouts, retries, history kept across refreshes.",
      fr: "Un tableau de bord en JavaScript natif qui lit les capteurs ESP32 via l'API REST de Home Assistant et les compare à Open-Meteo, rendu fiable : pas de jeton dans le code, délais d'attente, nouvelles tentatives, historique conservé.",
    },
    results: [
      { en: "13 tests on the unchanged code run in CI and caught one real bug.", fr: "13 tests sur le code non modifié tournent en CI et ont trouvé un vrai bug." },
    ],
    stack: ["JavaScript", "Home Assistant", "REST API", "ESP32", "Chart.js"],
  },
  {
    id: "smart-house-solar-energy", status: "done", year: "2022–2023",
    domains: ["analog", "iot"],
    stage: { en: "Bachelor's thesis, USTHB", fr: "Mémoire de Licence, USTHB" },
    title: { en: "Solar power supply for a smart-house model", fr: "Alimentation solaire d'une maquette de maison connectée" },
    tagline: {
      en: "Two 6 V panels, a TP4056 charger, an 18650 cell and an XL6009 boost feeding an Arduino. PV sizing for a real house redone in Python, tested, and compared with multimeter measurements.",
      fr: "Deux panneaux 6 V, un chargeur TP4056, un élément 18650 et un élévateur XL6009 qui alimentent un Arduino. Dimensionnement PV d'une vraie maison refait en Python, testé et comparé aux mesures au multimètre.",
    },
    results: [
      { en: "Measured 585 mA charge current at 5.72 V panel voltage; sizing for 9,281 Wh/day, driven by the fridge.", fr: "Courant de charge mesuré à 585 mA sous 5,72 V ; dimensionnement pour 9 281 Wh/jour, dominé par le réfrigérateur." },
    ],
    stack: ["Arduino", "TP4056", "XL6009", "Python", "pytest"],
  },

  /* ---------------- Software ---------------- */
  {
    id: "simu_ferroviaire", status: "done", year: "",
    domains: ["sw"],
    stage: { en: "Course project", fr: "Projet de cours" },
    title: { en: "Multithreaded railway traffic simulator", fr: "Simulateur de circulation ferroviaire multithread" },
    tagline: {
      en: "Seven trains as POSIX threads on a Lorraine network with single tracks, junctions and stations. Two trains must never share a section; a control process watches traffic, priorities and deadlocks through pipes.",
      fr: "Sept trains en threads POSIX sur un réseau lorrain avec voies uniques, carrefours et gares. Deux trains ne doivent jamais partager une section ; un processus de contrôle surveille trafic, priorités et interblocages via des pipes.",
    },
    results: [
      { en: "Two strategies: deadlock detection (Holt graph reduction, victim backs off) and prevention (all-or-nothing route reservation).", fr: "Deux stratégies : détection d'interblocage (réduction de graphe de Holt, la victime recule) et prévention (réservation d'itinéraire tout-ou-rien)." },
      { en: "Safety invariant checked independently by the control process; ThreadSanitizer build.", fr: "Invariant de sécurité vérifié indépendamment par le processus de contrôle ; compilation ThreadSanitizer." },
    ],
    stack: ["C", "POSIX threads", "semaphores", "pipes", "fork", "TSan"],
  },
];

window.EXPERIENCE = [
  {
    when: "2026 – 2027",
    title: { en: "M2 Communicating Electronic Systems Design (CSEC)", fr: "M2 Conception de systèmes électroniques communicants (CSEC)" },
    where: { en: "University of Lorraine, Metz", fr: "Université de Lorraine, Metz" },
  },
  {
    when: "2025 – 2026",
    title: { en: "M1 Communicating Electronic Systems Design (CSEC)", fr: "M1 Conception de systèmes électroniques communicants (CSEC)" },
    where: { en: "University of Lorraine, Metz", fr: "Université de Lorraine, Metz" },
  },
  {
    when: "→ 2025",
    title: { en: "Master's in Electronics, Embedded Systems", fr: "Master Électronique des systèmes embarqués" },
    where: { en: "USTHB, Algiers · thesis: connected health monitor", fr: "USTHB, Alger · mémoire : moniteur de santé connecté" },
  },
  {
    when: { en: "Internship", fr: "Stage" },
    title: { en: "Low-power LoRaWAN metering node", fr: "Nœud de mesure LoRaWAN basse consommation" },
    where: {
      en: "CREDEG (Sonelgaz group) · ESP32 firmware for voltage and current measurement, deep-sleep state machine, LoRa-E5 module, MQTT",
      fr: "CREDEG (groupe Sonelgaz) · firmware ESP32 de mesure tension/courant, machine d'états avec sommeil profond, module LoRa-E5, MQTT",
    },
  },
  {
    when: "→ 2023",
    title: { en: "Bachelor's in Electronics", fr: "Licence d'électronique" },
    where: { en: "USTHB, Algiers · thesis: smart-house solar supply", fr: "USTHB, Alger · mémoire : alimentation solaire de maison connectée" },
  },
];

window.SKILLS = [
  { en: "FPGA & digital", fr: "FPGA & numérique", items: ["VHDL", "Quartus Prime", "Questa", "GHDL", "Cyclone IV", "Basys 3 (Artix-7)", "Gate-level simulation (SDF)", "Fixed point"] },
  { en: "Analog & hardware", fr: "Analogique & matériel", items: ["ngspice", "Altium Designer", "SKY130 PDK", "Monte Carlo / corners", "gm/Id", "Current sensing"] },
  { en: "Embedded", fr: "Embarqué", items: ["C / C++", "ARM NEON", "ESP32", "Arduino", "Raspberry Pi", "RP2040", "UART · SPI · I2C", "LoRaWAN", "POSIX threads"] },
  { en: "AI & data", fr: "IA & données", items: ["PyTorch", "scikit-learn", "XGBoost", "ONNX Runtime", "int8 quantization", "llama.cpp", "wav2vec 2.0", "Flower / Opacus"] },
  { en: "Security & industrial", fr: "Sécurité & industriel", items: ["CPA / TVLA", "Masking / hiding", "OpenPLC", "IEC 61131-3 ST", "Modbus TCP", "OPC UA"] },
  { en: "Method & tooling", fr: "Méthode & outils", items: ["Python", "pytest", "GitHub Actions", "CMake", "Git", "Linux", "Qt 6", "Flask", "Flutter", "MATLAB"] },
];

window.UI = {
  en: {
    nav: ["Projects", "Skills", "Path", "Contact"],
    featured: "Featured work",
    all: "All projects",
    allDomains: "All",
    method: "How I work",
    methodItems: [
      ["Spec first", "Requirements and success criteria are written down before the first measurement."],
      ["Tests that can fail", "I break the code on purpose to check that the tests catch it."],
      ["Honest numbers", "Intervals, several seeds, and only what has been measured. Work in progress says so."],
      ["Reproducible", "Every figure comes from a script in the repository and runs again in CI."],
    ],
    skills: "Skills",
    path: "Education & experience",
    contact: "Contact",
    contactText: "Open to internship offers in embedded systems, FPGA, electronics, embedded AI and test & validation.",
    repo: "Repository",
    soon: "Repository coming soon",
    close: "Close",
    stack: "Stack",
    results: "Key results",
    count: (n) => `${n} project${n > 1 ? "s" : ""}`,
    pdf: "PDF version",
    cvNote: "Every number on this site comes from the linked repository.",
    lang: "FR",
    langTitle: "Passer en français",
    footer: "Built by hand, no framework.",
  },
  fr: {
    nav: ["Projets", "Compétences", "Parcours", "Contact"],
    featured: "Projets phares",
    all: "Tous les projets",
    allDomains: "Tous",
    method: "Ma méthode",
    methodItems: [
      ["Cahier des charges d'abord", "Exigences et critères de réussite sont écrits avant la première mesure."],
      ["Des tests qui peuvent échouer", "Je casse le code exprès pour vérifier que les tests le voient."],
      ["Des chiffres honnêtes", "Intervalles, plusieurs graines, et seulement ce qui a été mesuré. Un travail en cours le dit."],
      ["Reproductible", "Chaque figure sort d'un script du dépôt et retourne en CI."],
    ],
    skills: "Compétences",
    path: "Formation & expérience",
    contact: "Contact",
    contactText: "Ouvert aux offres de stage en systèmes embarqués, FPGA, électronique, IA embarquée et test & validation.",
    repo: "Dépôt",
    soon: "Dépôt bientôt en ligne",
    close: "Fermer",
    stack: "Outils",
    results: "Résultats clés",
    count: (n) => `${n} projet${n > 1 ? "s" : ""}`,
    pdf: "Version PDF",
    cvNote: "Chaque chiffre de ce site vient du dépôt lié.",
    lang: "EN",
    langTitle: "Switch to English",
    footer: "Fait main, sans framework.",
  },
};

window.PROJECTS.forEach((p) => {
  if (p.repo === undefined) p.repo = GH + p.id;
});
