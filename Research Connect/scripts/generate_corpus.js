const fs = require('fs');
const path = require('path');

const corpusDir = path.join(__dirname, '..', 'Corpus');

// Topics and templates for generating diverse, realistic synthetic research papers
const domains = [
  {
    category: "Artificial Intelligence",
    topics: [
      { title: "Diffusion Models for Photorealistic Video Generation", prefix: "diffusion_models_video" },
      { title: "Self-Supervised Representation Learning on Massive Multimodal Datasets", prefix: "self_supervised_multimodal" },
      { title: "Meta-Learning Algorithms for Few-Shot Generalization", prefix: "meta_learning_few_shot" },
      { title: "Contrastive Language-Image Pretraining for Zero-Shot Semantic Segmentation", prefix: "clip_semantic_segmentation" },
      { title: "Efficient Model Pruning and Quantization for Mobile Neural Networks", prefix: "model_pruning_quantization" },
      { title: "Sparse Mixture of Experts Architecture for Scalable Foundation Models", prefix: "sparse_mixture_of_experts" },
      { title: "Explainable Artificial Intelligence for Credit Risk Assessment", prefix: "xai_credit_risk" },
      { title: "Neural Architecture Search via Differentiable Hyperparameter Optimization", prefix: "neural_architecture_search" },
      { title: "Curriculum Learning Strategies in Deep Neural Networks", prefix: "curriculum_learning_strategies" },
      { title: "Physics-Informed Neural Networks for Fluid Dynamics Simulation", prefix: "physics_informed_neural_nets" }
    ]
  },
  {
    category: "Natural Language Processing",
    topics: [
      { title: "Instruction Fine-Tuning and Reinforcement Learning from Human Feedback", prefix: "rlhf_instruction_finetuning" },
      { title: "Retrieval-Augmented Generation for Hallucination Mitigation in LLMs", prefix: "rag_hallucination_mitigation" },
      { title: "Low-Rank Adaptation Techniques for Parameter-Efficient LLM Fine-Tuning", prefix: "lora_parameter_efficient" },
      { title: "Cross-Lingual Knowledge Transfer Across Low-Resource Dialects", prefix: "cross_lingual_transfer" },
      { title: "Long-Context Attention Mechanisms via Rotary Position Embeddings", prefix: "long_context_rope_attention" },
      { title: "Mechanistic Interpretability of Transformer Attention Heads", prefix: "mechanistic_interpretability" },
      { title: "Prompt Engineering and Chain-of-Thought Reasoning in Complex Math Tasks", prefix: "chain_of_thought_reasoning" },
      { title: "Automated Abstractive Summarization with Multi-Document Coreference Resolution", prefix: "abstractive_summarization" },
      { title: "Semantic Parsing and Code Generation with Large Language Models", prefix: "semantic_parsing_code_generation" },
      { title: "Speech Recognition and Multilingual Voice Synthesis Using End-to-End Conformer", prefix: "conformer_speech_synthesis" }
    ]
  },
  {
    category: "Computer Vision",
    topics: [
      { title: "Neural Radiance Fields for Real-Time Novel View Synthesis", prefix: "nerf_novel_view_synthesis" },
      { title: "Masked Autoencoders as Scalable Vision Learners", prefix: "masked_autoencoders_vision" },
      { title: "Optical Flow Estimation Using Recurrent All-Pairs Field Transforms", prefix: "optical_flow_raft" },
      { title: "3D Gaussian Splatting for High-Frame-Rate Scene Reconstruction", prefix: "3d_gaussian_splatting" },
      { title: "Adversarial Robustness in Deep Convolutional Image Classifiers", prefix: "adversarial_robustness_vision" },
      { title: "Multi-Object Tracking and Trajectory Forecasting with Spatial-Temporal Graphs", prefix: "multi_object_tracking_graphs" },
      { title: "Monocular Depth Estimation via Dense Feature Transformer Pyramid Networks", prefix: "monocular_depth_estimation" },
      { title: "Fine-Grained Visual Recognition Using Part-Attention Models", prefix: "part_attention_fine_grained" },
      { title: "Event Camera Sensor Fusion for High-Speed Robotics Vision", prefix: "event_camera_sensor_fusion" },
      { title: "Self-Supervised Video Representation Learning via Spatio-Temporal Contrast", prefix: "video_representation_contrast" }
    ]
  },
  {
    category: "Cybersecurity",
    topics: [
      { title: "Automated Vulnerability Discovery via Symbolic Execution and Smart Fuzzing", prefix: "symbolic_execution_fuzzing" },
      { title: "Post-Quantum Lattice-Based Cryptographic Signatures and Verification", prefix: "post_quantum_lattice_signatures" },
      { title: "Microarchitectural Side-Channel Attacks and Hardware Mitigation Mechanisms", prefix: "spectre_meltdown_sidechannel" },
      { title: "Behavioral Intrusion Detection in Cloud Workloads Using Anomaly Scoring", prefix: "behavioral_intrusion_detection" },
      { title: "Secure Multi-Party Computation for Collaborative Fraud Detection", prefix: "smpc_fraud_detection" },
      { title: "Dynamic Malware Classification Using Graph Neural Networks on API Call Graphs", prefix: "malware_gnn_api_call_graph" },
      { title: "Container Security and Runtime Isolation in Multi-Tenant Kubernetes Clusters", prefix: "container_security_kubernetes" },
      { title: "Differential Privacy in High-Dimensional Database Query Answering", prefix: "differential_privacy_queries" },
      { title: "Decentralized Public Key Infrastructure Using Distributed Ledgers", prefix: "decentralized_pki_ledger" },
      { title: "Adversarial Machine Learning Attacks on Network Intrusion Detectors", prefix: "adversarial_attacks_ids" }
    ]
  },
  {
    category: "Quantum Computing",
    topics: [
      { title: "Variational Quantum Eigensolvers for Molecular Ground State Estimation", prefix: "vqe_molecular_simulation" },
      { title: "Quantum Supremacy Benchmarks Using Random Circuit Sampling on Superconducting Qubits", prefix: "quantum_supremacy_benchmarks" },
      { title: "Quantum Approximate Optimization Algorithms for Combinatorial Graph Problems", prefix: "qaoa_graph_optimization" },
      { title: "Trapped-Ion Quantum Processors with High-Fidelity Entangling Gates", prefix: "trapped_ion_entangling_gates" },
      { title: "Noise-Resilient Quantum Machine Learning via Parameterized Quantum Circuits", prefix: "quantum_machine_learning_circuits" },
      { title: "Topological Quantum Memory Architectures Using Majorana Fermions", prefix: "topological_quantum_memory" },
      { title: "Quantum Compiler Optimization and Qubit Mapping for NISQ Hardware", prefix: "quantum_compiler_nisq_mapping" },
      { title: "Measurement-Based Quantum Computing and Continuous-Variable Cluster States", prefix: "measurement_based_quantum" },
      { title: "Quantum Random Number Generation via Vacuum State Fluctuations", prefix: "quantum_random_number_gen" },
      { title: "Silicon Spin Qubit Coherence and Fast Microwave Control Protocols", prefix: "silicon_spin_qubits_control" }
    ]
  },
  {
    category: "Computer Networks",
    topics: [
      { title: "Programmable Telemetry and In-Band Network Monitoring Using P4", prefix: "programmable_telemetry_p4" },
      { title: "Ultra-Reliable Low-Latency Communication in 6G Terahertz Networks", prefix: "urllc_6g_terahertz" },
      { title: "Congestion Control in Datacenter Networks with Explicit Congestion Notification", prefix: "datacenter_congestion_control" },
      { title: "LEO Satellite Constellation Routing and Inter-Satellite Optical Crosslinks", prefix: "leo_satellite_routing" },
      { title: "QUIC Protocol Performance and Multipath Transport Optimization", prefix: "quic_protocol_multipath" },
      { title: "Network Slicing Orchestration for Autonomous Vehicle Fleets", prefix: "network_slicing_autonomous_vehicles" },
      { title: "Zero-Touch Autonomous Network Management via Deep Reinforcement Learning", prefix: "zero_touch_network_mgmt" },
      { title: "Software-Defined Wide Area Networking with Intelligent Path Selection", prefix: "sdwan_intelligent_path" },
      { title: "Energy-Efficient Sleep Scheduling Protocols in Dense Wireless Sensor Networks", prefix: "wireless_sensor_energy_scheduling" },
      { title: "Time-Sensitive Networking for Industrial Automation and Factory Robotics", prefix: "time_sensitive_networking_industry" }
    ]
  },
  {
    category: "Edge Computing & IoT",
    topics: [
      { title: "TinyML: Deep Learning Inference on Ultra-Low-Power Microcontrollers", prefix: "tinyml_inference_microcontrollers" },
      { title: "Collaborative Edge Caching and Computational Task Offloading", prefix: "edge_caching_task_offloading" },
      { title: "Energy-Harvesting IoT Nodes with Intermittent Computing Architecture", prefix: "energy_harvesting_iot_nodes" },
      { title: "LoRaWAN Optimization for Long-Range Agricultural Sensing Systems", prefix: "lorawan_smart_agriculture" },
      { title: "Digital Twin Modeling for Predictive Maintenance of Wind Turbine Fleets", prefix: "digital_twin_wind_turbines" },
      { title: "Secure Firmware Over-The-Air Updates for Massive IoT Deployments", prefix: "secure_fota_iot_updates" },
      { title: "Context-Aware Smart Home Orchestration Using Distributed Edge Broker", prefix: "smart_home_edge_broker" },
      { title: "Privacy-Preserving Edge Video Analytics with Ephemeral Frame Processing", prefix: "edge_video_analytics_privacy" },
      { title: "Sensor Fusion on Autonomous Mobile Robots for Hazardous Exploration", prefix: "autonomous_robots_sensor_fusion" },
      { title: "Wearable Health Monitoring System with Real-Time Arrhythmia Classification", prefix: "wearable_health_arrhythmia" }
    ]
  },
  {
    category: "Robotics & Autonomous Systems",
    topics: [
      { title: "Model Predictive Control for High-Speed Quadrupedal Robot Locomotion", prefix: "mpc_quadrupedal_locomotion" },
      { title: "Sim-to-Real Policy Transfer for Robotic Manipulation of Deformable Objects", prefix: "sim_to_real_manipulation" },
      { title: "Visual-Inertial Odometry and Dense Mapping for Micro Aerial Vehicles", prefix: "visual_inertial_odometry_mav" },
      { title: "Multi-Agent Flocking and Swarm Navigation in Obstacle-Dense Environments", prefix: "swarm_robotics_flocking" },
      { title: "Human-Robot Collaborative Assembly Using Force-Feedback Impedance Control", prefix: "human_robot_collaboration" },
      { title: "Semantic SLAM for Autonomous Indoor Warehouse Logistics Vehicles", prefix: "semantic_slam_warehouse_vehicles" },
      { title: "Tactile Sensing and Gripper Dexterity for Fragile Object Handling", prefix: "tactile_sensing_dexterity" },
      { title: "Underwater Autonomous Vehicle Navigation Using Doppler Velocity Logs", prefix: "underwater_auv_navigation" },
      { title: "Safe Trajectory Planning for Self-Driving Cars in Urban Intersections", prefix: "autonomous_cars_urban_planning" },
      { title: "End-to-End Imitation Learning for Visuomotor Robotic Tasks", prefix: "imitation_learning_visuomotor" }
    ]
  },
  {
    category: "Cloud & Distributed Systems",
    topics: [
      { title: "Serverless Computing Elasticity and Cold-Start Latency Optimization", prefix: "serverless_cold_start_latency" },
      { title: "Distributed Consensus Protocols: Raft and Paxos Under Asymmetric Network Partitions", prefix: "distributed_consensus_raft_paxos" },
      { title: "Consistent Hashing and Replication Strategies in Distributed Key-Value Stores", prefix: "consistent_hashing_key_value" },
      { title: "Distributed Tracing and Microservice Dependency Graph Analysis", prefix: "distributed_tracing_microservices" },
      { title: "Disaggregated Memory Architectures Using Compute Express Link Technology", prefix: "cxl_disaggregated_memory" },
      { title: "Geo-Replicated Database Transactions with Adaptive Spanner Concurrency Control", prefix: "geo_replicated_spanner_transactions" },
      { title: "Fault-Tolerant Stream Processing Engines with Exactly-Once Semantics", prefix: "stream_processing_exactly_once" },
      { title: "Green Datacenter Scheduling and Carbon-Aware Workload Placement", prefix: "carbon_aware_cloud_scheduling" },
      { title: "Autoscaling Stateful Stateful Microservices in Multi-Cloud Environments", prefix: "stateful_microservices_autoscaling" },
      { title: "High-Throughput Distributed File Systems for AI Training Clusters", prefix: "distributed_file_systems_ai" }
    ]
  },
  {
    category: "Blockchain & Decentralized Systems",
    topics: [
      { title: "Zero-Knowledge Rollups for High-Throughput Layer-2 Ethereum Scaling", prefix: "zk_rollups_ethereum_scaling" },
      { title: "Formal Verification of Smart Contracts Using Automated Theorem Provers", prefix: "formal_verification_smart_contracts" },
      { title: "Decentralized Finance Flash Loans and Arbitrage Risk Quantification", prefix: "defi_flash_loans_arbitrage" },
      { title: "Cross-Chain Atomic Swaps and Interoperability Bridges", prefix: "cross_chain_atomic_swaps" },
      { title: "Proof-of-Useful-Work Consensus Powered by Machine Learning Training Tasks", prefix: "proof_of_useful_work" },
      { title: "Decentralized Autonomous Organizations Governance and Sybil Attack Immunity", prefix: "dao_governance_sybil_immunity" },
      { title: "InterPlanetary File System Content Addressing and Decentralized Storage Incentives", prefix: "ipfs_storage_incentives" },
      { title: "Decentralized Oracles: Byzantine Fault Tolerant Real-World Data Feeds", prefix: "decentralized_oracles_data_feeds" },
      { title: "Private Cryptocurrency Transactions Using Ring Signatures and Bulletproofs", prefix: "ring_signatures_bulletproofs" },
      { title: "Blockchain-Based Supply Chain Provenance and Anti-Counterfeiting", prefix: "blockchain_supply_chain_provenance" }
    ]
  },
  {
    category: "Healthcare AI & Bioinformatics",
    topics: [
      { title: "Deep Learning for Protein Structure Prediction and Drug Target Discovery", prefix: "protein_structure_drug_discovery" },
      { title: "Self-Supervised Pathology Whole-Slide Image Classification and Cancer Grading", prefix: "pathology_whole_slide_classification" },
      { title: "Multimodal Clinical Decision Support Combining Electronic Health Records and Imaging", prefix: "clinical_decision_support_ehr" },
      { title: "Genomic Variant Calling and DNA Sequence Assembly Using Graph Transformers", prefix: "genomic_variant_calling_transformers" },
      { title: "Automated Diabetic Retinopathy Screening Using Convolutional Neural Networks", prefix: "diabetic_retinopathy_screening" },
      { title: "Federated Learning for Rare Disease Biomarker Discovery Across Hospital Consortia", prefix: "federated_learning_rare_disease" },
      { title: "Real-Time Patient Sepsis Prediction in Intensive Care Units Using RNNs", prefix: "sepsis_prediction_icu_rnns" },
      { title: "Privacy-Preserving Synthetic Patient Record Generation via Conditional GANs", prefix: "synthetic_health_records_gans" },
      { title: "Explainable AI in Radiological Chest X-Ray Diagnosis with Heatmap Attribution", prefix: "radiology_cxr_attribution_heatmaps" },
      { title: "Neuroimaging Analysis of Alzheimer Progression Using 3D DenseNet", prefix: "alzheimer_neuroimaging_3d_densenet" }
    ]
  },
  {
    category: "Software Engineering & Data Mining",
    topics: [
      { title: "Automated Program Repair Using Transformer-Based Sequence-to-Sequence Models", prefix: "automated_program_repair_transformers" },
      { title: "Graph Mining on Software Repositories for Technical Debt Detection", prefix: "software_mining_technical_debt" },
      { title: "Neural Code Search: Semantic Code Retrieval with Bi-Encoder Embedding Models", prefix: "neural_code_search_biencoder" },
      { title: "Continuous Integration Flaky Test Prediction Using Machine Learning", prefix: "ci_flaky_test_prediction" },
      { title: "Large-Scale Graph Analytics on Billions of Nodes Using Distributed Pregel", prefix: "large_scale_graph_pregel" },
      { title: "Context-Aware Recommender Systems Using Sequential Self-Attention Networks", prefix: "sequential_recommender_attention" },
      { title: "Knowledge Graph Embedding and Link Prediction for Biomedical Entities", prefix: "knowledge_graph_link_prediction" },
      { title: "Automated Test Case Generation via Large Language Model Exploration", prefix: "test_case_generation_llms" },
      { title: "Multi-Armed Bandit Algorithms for Real-Time Ad Placement Optimization", prefix: "multi_armed_bandit_ad_placement" },
      { title: "Graph Contrastive Learning for Social Network Community Detection", prefix: "graph_contrastive_community_detection" }
    ]
  },
  {
    category: "Smart Cities & Intelligent Systems",
    topics: [
      { title: "Deep Spatio-Temporal Graph Neural Networks for Urban Traffic Flow Forecasting", prefix: "traffic_flow_forecasting_stgnn" },
      { title: "Smart Grid Dynamic Pricing and Demand-Response Optimization with Reinforcement Learning", prefix: "smart_grid_demand_response" },
      { title: "Intelligent Water Distribution Network Leakage Localization Using Sensor Telemetry", prefix: "smart_water_leakage_localization" },
      { title: "Automated Parking Space Detection and Guidance Using Drone Imagery", prefix: "parking_detection_guidance_drone" },
      { title: "Air Quality Index Forecasting in Megacities Using Spatial Attention LSTM", prefix: "air_quality_forecasting_lstm" },
      { title: "Public Transit Fleet Electrification Scheduling and Battery Degradation Minimization", prefix: "electric_bus_fleet_scheduling" },
      { title: "Streetlight Energy Optimization via Automated Pedestrian Density Sensing", prefix: "smart_streetlight_pedestrian_sensing" },
      { title: "Urban Flood Early Warning System Using Satellite Radar and Hydrological Simulation", prefix: "urban_flood_radar_warning" },
      { title: "Intelligent Waste Sorting and Automated Recycling Facility Robotics", prefix: "intelligent_waste_sorting_robotics" },
      { title: "Emergency Medical Vehicle Dispatch and Dynamic Route Preemption Protocols", prefix: "emergency_vehicle_route_preemption" }
    ]
  },
  {
    category: "Information Security & Cryptography",
    topics: [
      { title: "Authenticated Key Exchange Protocols with Forward Secrecy in Adversarial Channels", prefix: "authenticated_key_exchange_secrecy" },
      { title: "Hardware Security Modules: Secure Enclaves and Memory Encryption Architectures", prefix: "secure_enclaves_memory_encryption" },
      { title: "Password-Authenticated Key Agreement Resistant to Offline Dictionary Attacks", prefix: "pake_offline_dictionary_defense" },
      { title: "Steganography Detection in High-Resolution Audio Streams Using Deep Residual Networks", prefix: "audio_steganography_residual_nets" },
      { title: "Zero-Knowledge Contingent Payments for Fair Data Exchanges Over Blockchains", prefix: "zk_contingent_payments_blockchain" },
      { title: "Elliptic Curve Cryptography Optimization for Embedded Microcontroller Hardware", prefix: "ecc_optimization_microcontrollers" },
      { title: "Threshold Cryptography and Distributed Key Generation for Validator Networks", prefix: "threshold_cryptography_distributed_keygen" },
      { title: "DNS-over-HTTPS Privacy Auditing and Traffic Fingerprinting Countermeasures", prefix: "doh_traffic_fingerprinting_defense" },
      { title: "Ransomware Early Detection via File System Canary Traps and Entropy Monitoring", prefix: "ransomware_early_entropy_detection" },
      { title: "Side-Channel Power Analysis Attacks on AES Implementations and Masking Defenses", prefix: "aes_sidechannel_power_masking" }
    ]
  },
  {
    category: "Data Science & Machine Learning",
    topics: [
      { title: "Causal Inference in Observational Studies via Doubly Robust Estimators", prefix: "causal_inference_doubly_robust" },
      { title: "High-Dimensional Time Series Anomaly Detection via Temporal Convolutional Networks", prefix: "time_series_anomaly_tcn" },
      { title: "Unsupervised Domain Adaptation via Wasserstein Distribution Alignment", prefix: "domain_adaptation_wasserstein" },
      { title: "Active Learning Strategies for Cost-Effective Medical Data Annotation", prefix: "active_learning_medical_annotation" },
      { title: "Out-of-Distribution Detection in Neural Classifiers Using Energy-Based Scoring", prefix: "ood_detection_energy_scoring" },
      { title: "Fairness-Aware Machine Learning via Invariant Risk Minimization", prefix: "fairness_invariant_risk_minimization" },
      { title: "Bayesian Optimization for Expensive High-Dimensional Chemistry Experiments", prefix: "bayesian_optimization_chemistry" },
      { title: "Synthetic Data Generation for Tabular Datasets with Differential Privacy", prefix: "synthetic_tabular_data_dp" },
      { title: "Multi-Task Learning with Dynamic Task Weighting and Gradient Surgery", prefix: "multitask_learning_gradient_surgery" },
      { title: "Continual Learning Without Catastrophic Forgetting via Memory Replay Buffers", prefix: "continual_learning_replay_buffers" }
    ]
  },
  {
    category: "Autonomous Systems & 5G/6G",
    topics: [
      { title: "Cell-Free Massive MIMO Architecture for High-Density Urban Environments", prefix: "cell_free_massive_mimo" },
      { title: "Reconfigurable Intelligent Surfaces for Millimeter-Wave Beamforming Optimization", prefix: "reconfigurable_intelligent_surfaces" },
      { title: "Non-Terrestrial Networks: Direct-to-Cell Satellite Handover Optimization", prefix: "ntn_satellite_handover_direct" },
      { title: "Vehicle-to-Everything V2X Communication for Cooperative Autonomous Driving", prefix: "v2x_cooperative_autonomous_driving" },
      { title: "Integrated Sensing and Communication ISAC for 6G Wireless Systems", prefix: "isac_integrated_sensing_communication" },
      { title: "Autonomous Underwater Drone Swarms for Bathymetric Seabed Mapping", prefix: "underwater_drone_swarms_bathymetry" },
      { title: "Deep Q-Learning for Dynamic Channel Allocation in Heterogeneous Small Cells", prefix: "deep_q_learning_channel_allocation" },
      { title: "Unmanned Aerial Vehicle Cellular Base Stations for Disaster Recovery Comms", prefix: "uav_cellular_disaster_recovery" },
      { title: "Low-Latency Edge AI Inference for Remote Surgical Robotic Teleoperation", prefix: "edge_ai_teleoperation_surgical" },
      { title: "Semantic Communications for Bandwidth-Constrained Deep Space Missions", prefix: "semantic_communications_deep_space" },
      { title: "Quantum Entanglement Swapping in Continental-Scale Quantum Repeaters", prefix: "quantum_entanglement_swapping_repeaters" },
      { title: "Brain-Computer Interface Decoding with Spatial-Temporal Convolutional Transformers", prefix: "bci_decoding_convolutional_transformers" },
      { title: "Neuromorphic Event-Based Vision for High-Speed Drone Obstacle Avoidance", prefix: "neuromorphic_vision_drone_avoidance" },
      { title: "Federated Edge Computing for Smart Power Grid Load Balancing", prefix: "federated_edge_smart_grid_balancing" },
      { title: "Autonomous Marine Vessel Navigation in Ice-Covered Polar Passages", prefix: "autonomous_marine_ice_navigation" }
    ]
  }
];

// Realistic authors pool
const authorFirstNames = ["Aarav", "Elena", "Liam", "Mei", "Hiroshi", "Lucas", "Sophie", "Carlos", "Priya", "Alexander", "Fatima", "David", "Ananya", "Marcus", "Kavya", "Daniel", "Chloe", "Zain", "Siddharth", "Ingrid", "Tariq", "Hina", "Vikram", "Nina", "Gabriel", "Rohan", "Hannah", "Chen", "Yuki", "Stefan"];
const authorLastNames = ["Sharma", "Vance", "Kowalski", "Chen", "Takahashi", "Rostova", "Dubois", "Nair", "Patel", "Gomez", "Lindqvist", "Bennett", "Wright", "Kipf", "Rossi", "Petrenko", "Thorne", "Miller", "Barker", "Uszkoreit", "Vaikuntanathan", "Halevi", "Gentry", "Fowler", "Martinis", "Szegedy", "Goodfellow", "Abbeel", "Levine", "Vaswani"];

function getRandomAuthor() {
  const count = Math.random() > 0.4 ? 3 : 2;
  const chosen = [];
  while (chosen.length < count) {
    const fn = authorFirstNames[Math.floor(Math.random() * authorFirstNames.length)];
    const ln = authorLastNames[Math.floor(Math.random() * authorLastNames.length)];
    const name = `${fn} ${ln}`;
    if (!chosen.includes(name)) chosen.push(name);
  }
  return chosen.join(", ");
}

function getRandomYear() {
  return 2019 + Math.floor(Math.random() * 7); // 2019 to 2025
}

function generatePaperContent(title, category) {
  return `This research paper introduces an innovative methodology in the field of ${category}, focusing specifically on ${title.toLowerCase()}. As modern computing systems face growing complexity, resource constraints, and demanding accuracy requirements, traditional approaches often exhibit significant performance bottlenecks and scalability limitations. We present a novel framework that systematically addresses these challenges through algorithmic optimization, resilient system architecture, and robust empirical validation.

Our proposed architecture integrates multi-scale representations and advanced loss functions designed to maximize computational efficiency while preserving statistical rigor. Extensive experimental evaluations were performed across benchmark datasets under varied operational settings. The empirical results demonstrate that our framework achieves a 28.4% improvement in execution speed, a 34.2% reduction in memory overhead, and superior convergence characteristics compared to state-of-the-art baselines. Furthermore, ablation studies verify the individual contribution of each system component, confirming the resilience of the algorithmic design under high-noise and data-sparse conditions.

In conclusion, our contributions provide a scalable, efficient, and theoretically sound foundation for future research in ${category.toLowerCase()} and related disciplines. Practical applications range from real-time edge processing and autonomous robotics to enterprise security and cloud-native workflows. Future research directions include extending the framework to multi-agent distributed topologies, exploring zero-shot adaptation across heterogeneous environments, and conducting formal safety verification for safety-critical industrial deployments.`;
}

// Collect all synthetic topics
let syntheticTopics = [];
for (const domain of domains) {
  for (const topic of domain.topics) {
    syntheticTopics.push({
      category: domain.category,
      title: topic.title,
      prefix: topic.prefix
    });
  }
}

console.log(`Total available topic templates: ${syntheticTopics.length}`);

// We need 165 synthetic papers (IDs 116 to 280)
const targetSyntheticCount = 165;
const generatedPapers = [];

for (let i = 0; i < targetSyntheticCount; i++) {
  const id = 116 + i;
  const topic = syntheticTopics[i % syntheticTopics.length];
  const title = (i >= syntheticTopics.length) 
    ? `${topic.title}: Advanced Theoretical and Empirical Analysis`
    : topic.title;
  
  const author = getRandomAuthor();
  const year = getRandomYear();
  const category = topic.category;
  const content = generatePaperContent(title, category);
  
  // Format matching existing corpus:
  // Line 1: Title
  // Line 2: Author
  // Line 3: Year
  // Line 4: Category
  // Line 5: blank line
  // Line 6+: Content
  const fileContent = `${title}\n${author}\n${year}\n${category}\n\n${content}\n`;
  
  const filename = `synthetic_${id}_${topic.prefix}.txt`;
  const filePath = path.join(corpusDir, filename);
  
  fs.writeFileSync(filePath, fileContent, 'utf8');
  generatedPapers.push({
    id,
    title,
    author,
    year,
    category,
    filename
  });
}

console.log(`Successfully generated ${generatedPapers.length} synthetic paper files in ${corpusDir}`);

// Now read existing citations.txt
const citationsFile = path.join(corpusDir, 'citations.txt');
let existingCitations = fs.readFileSync(citationsFile, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0 && !l.startsWith('#'));

const citationPairs = new Set(existingCitations);

// Helper to add citation
function addCitation(fromId, toId) {
  if (fromId === toId) return;
  const pair = `${fromId},${toId}`;
  citationPairs.add(pair);
}

// Categorize synthetic papers by domain
const papersByCategory = {};
for (const p of generatedPapers) {
  if (!papersByCategory[p.category]) papersByCategory[p.category] = [];
  papersByCategory[p.category].push(p);
}

// Foundational papers:
// 101: Attention / Transformers (AI/NLP)
// 102: Blockchain Consensus (Cybersecurity)
// 103: Deep Residual Learning (ResNet - AI)
// 104: Edge Computing / IoT (Networks)
// 105: Federated Learning (AI/Security)
// 106: GANs (AI)
// 107: Graph Neural Networks (AI)
// 108: Homomorphic Encryption (Cybersecurity)
// 109: Quantum Error Correction (Quantum)
// 110: Quantum Key Distribution (Quantum)
// 111: Reinforcement Learning Drone (Robotics/AI)
// 112: Software-Defined Networking 5G (Networks)
// 113: Vision Transformers (AI/Vision)
// 114: Zero-Trust Architecture (Cybersecurity)
// 115: Zero-Knowledge Proofs (Cybersecurity)

// Connect new synthetic papers to foundational papers and within their categories
for (const p of generatedPapers) {
  // Connect to foundational papers based on category
  if (p.category === "Artificial Intelligence" || p.category === "Natural Language Processing" || p.category === "Computer Vision") {
    if (Math.random() > 0.3) addCitation(p.id, 101); // cites Transformers
    if (Math.random() > 0.4) addCitation(p.id, 103); // cites ResNet
    if (p.category === "Computer Vision" && Math.random() > 0.4) addCitation(p.id, 113); // cites Vision Transformers
  } else if (p.category === "Cybersecurity" || p.category === "Information Security & Cryptography" || p.category === "Blockchain & Decentralized Systems") {
    if (Math.random() > 0.3) addCitation(p.id, 114); // cites Zero Trust
    if (Math.random() > 0.4) addCitation(p.id, 108); // cites Homomorphic Encryption
    if (Math.random() > 0.5) addCitation(p.id, 102); // cites Blockchain
    if (Math.random() > 0.5) addCitation(p.id, 115); // cites Zero-Knowledge Proofs
  } else if (p.category === "Quantum Computing") {
    if (Math.random() > 0.3) addCitation(p.id, 110); // cites QKD
    if (Math.random() > 0.4) addCitation(p.id, 109); // cites Quantum Error Correction
  } else if (p.category === "Computer Networks" || p.category === "Autonomous Systems & 5G/6G") {
    if (Math.random() > 0.3) addCitation(p.id, 112); // cites SDN 5G
    if (Math.random() > 0.4) addCitation(p.id, 104); // cites Edge IoT
  } else if (p.category === "Edge Computing & IoT") {
    if (Math.random() > 0.3) addCitation(p.id, 104); // cites Edge IoT
    if (Math.random() > 0.5) addCitation(p.id, 105); // cites Federated Learning
  } else if (p.category === "Robotics & Autonomous Systems") {
    if (Math.random() > 0.3) addCitation(p.id, 111); // cites RL Drone
    if (Math.random() > 0.5) addCitation(p.id, 103); // cites ResNet
  } else if (p.category === "Healthcare AI & Bioinformatics") {
    if (Math.random() > 0.4) addCitation(p.id, 101); // cites Transformers
    if (Math.random() > 0.4) addCitation(p.id, 105); // cites Federated Learning
  } else if (p.category === "Cloud & Distributed Systems") {
    if (Math.random() > 0.4) addCitation(p.id, 114); // cites Zero Trust
    if (Math.random() > 0.4) addCitation(p.id, 104); // cites Edge IoT
  }

  // Connect to 1-3 other papers in the same category
  const sameCategory = papersByCategory[p.category] || [];
  for (let c = 0; c < 2; c++) {
    if (sameCategory.length > 1) {
      const other = sameCategory[Math.floor(Math.random() * sameCategory.length)];
      if (other.id !== p.id && other.id < p.id) { // citation points to earlier/same era paper
        addCitation(p.id, other.id);
      }
    }
  }
}

// Add some cross-domain citations for rich traversal paths
for (let i = 0; i < 40; i++) {
  const p1 = generatedPapers[Math.floor(Math.random() * generatedPapers.length)];
  const p2 = generatedPapers[Math.floor(Math.random() * generatedPapers.length)];
  if (p1.id > p2.id) {
    addCitation(p1.id, p2.id);
  }
}

const updatedCitations = Array.from(citationPairs).sort((a, b) => {
  const [a1, a2] = a.split(',').map(Number);
  const [b1, b2] = b.split(',').map(Number);
  return a1 !== b1 ? a1 - b1 : a2 - b2;
});

fs.writeFileSync(citationsFile, updatedCitations.join('\n') + '\n', 'utf8');
console.log(`Updated citations.txt with ${updatedCitations.length} total citation relationships!`);
